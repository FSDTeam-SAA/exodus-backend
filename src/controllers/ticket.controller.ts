import { Request, Response, NextFunction } from 'express'
import { Ticket } from '../models/ticket.model'
import { User } from '../models/user.model'
import QRCode from 'qrcode'
import AppError from '../errors/AppError'
import catchAsync from '../utils/catchAsync'
import { Bus } from '../models/bus.model'
import { Schedule } from '../models/schedule.model'
import sendResponse from '../utils/sendResponse'
import httpStatus from 'http-status'
import { generateDefaultSeats } from '../interface/bus.interface'
import { generateUniqueString } from '../utils/generateOTP'
import { io } from '../app'
import { Notification } from '../models/notifications.model'

export const createTicket = catchAsync(async (req, res) => {
  const {
    seatNumber,
    busNumber,
    source,
    destination,
    date,
  } = req.body;

  console.log(req.body);

  const bus = await Bus.findById(busNumber);

  if (!bus) {
    throw new AppError(404, 'Bus not found')
  }

  const stopNames = bus.stops.map((s: any) => s.name);
  const fromIndex = stopNames.indexOf(source);
  const toIndex = stopNames.indexOf(destination);

  if (fromIndex === -1 || toIndex === -1) {
    throw new AppError(404, 'Invalid source or destination')
  }


  const key = fromIndex < toIndex ? 'start' : 'end';

  // Step 3: Get the matching schedule by day
  const scheduleDoc = await Schedule.findOne({ busId: busNumber, isActive: true });
  // console.log(scheduleDoc);

  if (!scheduleDoc) {
    throw new AppError(404, 'Schedule not found')
  }

  const travelDate = new Date(date);
  let departureDateTime
  const now = new Date();
  console.log(travelDate)
  const dayOfWeek = travelDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Sun"

  const daySchedule = scheduleDoc.schedules.find((s: any) => s.day === dayOfWeek);
  if (!daySchedule) {
    throw new AppError(404, 'Schedule not found')
  }
  // Parse departure time (assuming format is "HH:mm", e.g., "14:30")
  const [hour, minute] = daySchedule.departureTime.split(':').map(Number);
  departureDateTime = new Date(travelDate);
  departureDateTime.setHours(hour, minute, 0, 0);
  console.log(departureDateTime)


  // Check if the travel date is in the past
  if (
    travelDate.toDateString() < now.toDateString() ||
    (travelDate.toDateString() === now.toDateString() && daySchedule?.departureTime)
  ) {
    if (departureDateTime < now) {
      throw new AppError(400, 'Cannot book ticket for past time');
    }
  }
  let avaiableSeat
  let qrCode
  const time = daySchedule.departureTime
  // let status = "pending"

  if (seatNumber !== "standing") {

    let totalSeat = generateDefaultSeats(bus.seat)


    // 2. Check if seat is already taken on this bus, date, time, and seatNumber
    const isSeatTaken = await Ticket.find({
      busNumber,
      date: departureDateTime,
      time: time,
    }).sort("-createdAt");

    if (isSeatTaken.length > 0) {
      totalSeat = isSeatTaken[0].avaiableSeat
      if (!totalSeat.includes(seatNumber.toString())) {
        throw new AppError(400, 'Seat is already taken')
      }
    }
    const seatToRemove = seatNumber.toString(); // if seatNumber is like 'A3' or convert number to label if needed
    avaiableSeat = totalSeat.filter(seat => seat !== seatToRemove);
  } else if (seatNumber === "standing") {
    const avaiableStand = await Ticket.countDocuments({
      seatNumber: "standing", busNumber,
      date: departureDateTime,
      time: time,
    })
    if (avaiableStand >= bus.standing) {
      throw new AppError(400, 'Standing seat is already full')
    }
  }

  const qrOptions = {
    color: {
      dark: '#C0A05C',   // QR color (e.g., blue)
      light: '#ffffff'   // background color (e.g., light peach)
    }
  };
  const ticket_secret = generateUniqueString()


  //  status = "booked"
  // }

  // Step 5: Create ticket
  const ticket = await Ticket.create({
    userId: req.user?._id,
    schedule: scheduleDoc._id,
    price: bus.price,
    seatNumber,
    busNumber,
    source,
    destination,
    date: departureDateTime,
    time: daySchedule.departureTime,
    ticket_secret,
    key,
    avaiableSeat,
  });

  console.log(ticket);

  const qrPayload = {
    id: ticket._id,
    code: ticket_secret
  };

  qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload), qrOptions);
  ticket.qrCode = qrCode;
  let _ticket = await ticket.save();

  const notifications = await Notification.create({
    userId: req.user?._id,
    message: `Ticket for ${bus.name} has been booked successfully`,
    type: "success",
  });
  io.to(`user_${req.user?._id}`).emit(notifications.message)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ticket created successfully',
    success: true,
    data: _ticket,
  })
});


// Get All Ticket for A single Bus and a spacific time
export const getAllTicket = catchAsync(async (req, res) => {
  const { busNumber, source, destination, date, time } = req.body;
  const [hour, minute] = time.split(':').map(Number);

  if (isNaN(hour) || isNaN(minute)) {
    throw new AppError(400, 'Invalid time format');
  }

  const departureDateTime = new Date(date as string);
  departureDateTime.setHours(hour, minute, 0, 0);

  const ticket = await Ticket.find({ busNumber, date: departureDateTime, time }).select("-qrCode -avaiableSeat").populate("busNumber","name")
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ticket found',
    success: true,
    data: ticket
  })
})

export const accpeteOrRejectStanding = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body
  const ticket = await Ticket.findById(id)
  if (!ticket) {
    throw new AppError(404, 'Ticket not found')
  }
  if (status === 'accepted') {
    const qrPayload = {
      busNumber: ticket.busNumber,
      userName: req?.user?.name,
      time: ticket.time,        // e.g. "14:30"
      from: ticket.source,
      to: ticket.destination,
      date: ticket.date         // e.g. "2025-05-10"
    };

    ticket.qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));
  }
  ticket.status = status;
  await ticket.save();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: `Standing Request ${status}`,
    success: true,
    data: ticket
  })

})

export const scanTicket = catchAsync(async (req, res) => {

  const { id,secret, stationName } = req.body;
  const ticket = await Ticket.findById(id)
  if (!ticket) {
    throw new AppError(404, 'Ticket not found')
  }
  if (ticket.status === 'cancelled') {
    throw new AppError(400, 'Ticket is cancelled')
  }
  if (ticket.ticket_secret !== secret) {
    console.log("Scan ->>");
    throw new AppError(401, 'Invalid QR code')
  }
  const qrOptions = {
    color: {
      dark: '#C0A05C',   // QR color (e.g., blue)
      light: '#ffffff'   // background color (e.g., light peach)
    }
  };

  const ticket_secret = generateUniqueString()

  const qrPayload = {
    id: ticket._id,
    code: ticket_secret
  };

  const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload), qrOptions);

  const bus = await Bus.findOne({ _id: ticket.busNumber })
  if (ticket.status === 'running') {
    const stopNames = bus?.stops.map((s: any) => s.name);
    const fromIndex = stopNames?.indexOf(stationName) || 1;
    const toIndex = stopNames?.indexOf(ticket.destination) || 1;
    if (fromIndex > toIndex && ticket.key === 'start') {
      const userInfo = await User.findById(ticket.userId)
      if (userInfo) {
        userInfo.fine = userInfo?.fine + 15;
      }

    }

    ticket.status = "completed"
  }
  else {
    ticket.status = "running"
  }
  ticket.qrCode = qrCode;
  ticket.ticket_secret = ticket_secret;
  const _ticket = await ticket.save()


  const notifications = await Notification.create({
    userId: _ticket.userId,
    message: `Congratulation You ${_ticket.status} the ${bus?.name} ride`,
    type: "success",
  });
  io.to(`user_${_ticket.userId}`).emit(notifications.message)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Ticket scanned successfully',
    data: _ticket
  })
})



// get All ticket for admin 
export const getTicket = catchAsync(async (req, res) => {
  if (req.user?.role !== "admin") {
    throw new AppError(401, 'You are not authorized to access this route')
  }

  const { page = '1', limit = '10' } = req.query;
  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Ticket.countDocuments();
  const ticket = await Ticket.find().skip(skip).limit(limitNumber);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ticket found',
    success: true,
    data: {
      ticket,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    },
  });
});



///cancle ticket
export const cancelTicket = catchAsync(async (req, res) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);
  if (!ticket) throw new AppError(404, 'Ticket not found');
  if (ticket.status === 'cancelled') throw new AppError(400, 'Ticket already cancelled');

  const now = new Date();

  if (ticket.date && now < ticket.date) {
    const fine = ticket.price * 0.1;
    const refund = ticket.price - fine;

    const userId = await User.findById({ _id: ticket.userId })
    if (!userId) {
      throw new AppError(404, 'User not found')
    }

    // Update user credit
    userId.credit = (userId.credit || 0) + refund;
    userId.fine = (userId.fine || 0) + fine;
    await userId.save();

    // Mark ticket as cancelled
    ticket.status = 'cancelled';
    await ticket.save();

    const notifications = await Notification.create({
      userId: req.user?._id,
      message: `Cancelation successfully, cancellation fee equating to 10%`,
      type: "success",
    });
    io.to(`user_${req.user?._id}`).emit(notifications.message)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Ticket cancelled',
      success: true,
      data: ticket
    })
  }

  throw new AppError(400, 'Cannot cancel ticket after departure time');
});

