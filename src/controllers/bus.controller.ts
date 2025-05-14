import httpStatus from 'http-status';
import { Bus } from '../models/bus.model';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import AppError from '../errors/AppError';
import { Schedule } from '../models/schedule.model';
import { Ticket } from '../models/ticket.model';
import { generateDefaultSeats } from '../interface/bus.interface';

// Create Bus
export const createBus = catchAsync(async (req, res) => {
  const { name, bus_number, seat, standing, source, stops, lastStop,price } = req.body;

  if (!name || !bus_number || !seat || standing === undefined || source === undefined || stops === undefined || lastStop === undefined || price === undefined) {
    throw new AppError(httpStatus.BAD_REQUEST, 'All fields are required');
  }

  const newBus = await Bus.create({ name, bus_number, seat, standing ,source, stops, lastStop,price});

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bus created successfully',
    data: newBus,
  });
});

// Get All Buses with pagination and search
export const getAllBuses = catchAsync(async (req, res) => {
  const { page = '1', limit = '10', search = '' } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // Build search filter
  const searchFilter = search
    ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { bus_number: { $regex: search, $options: 'i' } },
      ],
    }
    : {};

  const total = await Bus.countDocuments(searchFilter);
  const buses = await Bus.find(searchFilter).skip(skip).limit(limitNumber);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Buses retrieved successfully',
    data: {
      buses,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    },
  });
});

// Get Single Bus
export const getBusById = catchAsync(async (req, res) => {
  const { source, destination, time, date } = req.query;

  if (!source || !destination || !time || !date) {
    throw new AppError(400, 'source, destination, time, and date are required');
  }

  const bus = await Bus.findById(req.params.id);
  if (!bus) {
    throw new AppError(404, 'Bus not found');
  }

  const timeStr = time as string;
  const [hour, minute] = timeStr.split(':').map(Number);

  if (isNaN(hour) || isNaN(minute)) {
    throw new AppError(400, 'Invalid time format');
  }

  const departureDateTime = new Date(date as string);
  departureDateTime.setHours(hour, minute, 0, 0);

  console.log(departureDateTime)

  const tickets = await Ticket.find({
    seatNumber: { $ne: "standing" },
    time,
    date: departureDateTime,
    busNumber: bus._id
  }).sort("-createdAt");
  console.log(tickets)

  const latestTicket = tickets[0]; // may be undefined
  const availableSeat = latestTicket?.avaiableSeat ?? generateDefaultSeats(bus.seat); // fallback if no tickets

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus retrieved successfully',
    data: {
      bus,
      avaiableSeat: availableSeat
    },
  });

});

// Update Bus
export const updateBus = catchAsync(async (req, res) => {
  const { name, bus_number, seat, standing,source, stops, lastStop,price } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (bus_number !== undefined) updateData.bus_number = bus_number;
  if (seat !== undefined) updateData.seat = seat;
  if (standing !== undefined) updateData.standing = standing;
  if (source !== undefined) updateData.source = source;
  if (stops !== undefined) updateData.stops = stops;
  if (lastStop !== undefined) updateData.lastStop = lastStop;
  if (price !== undefined) updateData.price = price;

  const updatedBus = await Bus.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!updatedBus) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus updated successfully',
    data: updatedBus,
  });
});

// Delete Bus
export const deleteBus = catchAsync(async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);
  // const schedule = await scheduler.findByIdAndDelete({bus:bus._id})

  if (!bus) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus deleted successfully',
    data: bus,
  });
});

export const getAvailableBuses = catchAsync(async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Please provide from, to and date');
  }

  const travelDate = new Date(date as string);
  const today = new Date();
  const isToday = travelDate.toDateString() === today.toDateString();
  const dayOfWeek = travelDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Sun"

  const buses = await Bus.find().lean();

  // Filter buses that go from `from` to `to`
  const matchingBuses = buses.filter((bus) => {
    const stopNames = bus.stops.map((s: any) => s.name);
    const fromIndex = stopNames.indexOf(from as string);
    const toIndex = stopNames.indexOf(to as string);
    return fromIndex !== -1 && toIndex !== -1 ;
  });

  const busIds = matchingBuses.map((bus) => bus._id);

  let schedules = await Schedule.find({
    busId: { $in: busIds },
    schedules: {
      $elemMatch: { day: dayOfWeek },
    },
  }).populate('busId');

  // Filter schedules if today and departure time has passed
  // if (isToday) {
    const currentTime = `${travelDate.getHours().toString().padStart(2, '0')}:${travelDate.getMinutes().toString().padStart(2, '0')}`;
  console.log(currentTime)
    schedules = schedules.filter(schedule =>
      schedule.schedules.some((s: any) =>
        s.day === dayOfWeek && s.departureTime > currentTime
      )
    );
  // }

  // Map filtered schedules back to buses
  const filteredBuses = schedules.map(schedule => {
  const filteredSchedule = schedule.schedules.find(
    (s: any) => s.day === dayOfWeek
  );

  return {
    ...schedule.toObject(),
    schedules: [filteredSchedule],
  };
});

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Buses available',
    data: filteredBuses
  });
});

