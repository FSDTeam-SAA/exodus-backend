import httpStatus from 'http-status';
import { Bus } from '../models/bus.model';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import AppError from '../errors/AppError';

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
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus retrieved successfully',
    data: bus,
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

// export const
