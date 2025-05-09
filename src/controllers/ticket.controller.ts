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

export const createTicket = catchAsync(async (req, res) => {
  const {
    userId,
    schedule,
    price,
    validFor,
    seatNumber,
    busNumber,
    source,
    destination,
    date,
    paymentMethod,
    paymentStatus,
    transectionId
  } = req.body;

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


  const key = fromIndex < toIndex ? 'start' : 'back';

  // Step 3: Get the matching schedule by day
  const scheduleDoc = await Schedule.findById(schedule);
  if (!scheduleDoc) {
    throw new AppError(404, 'Schedule not found')
  }

  const travelDate = new Date(date);
  const dayOfWeek = travelDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Sun"

  const daySchedule = scheduleDoc.schedules.find((s: any) => s.day === dayOfWeek);
  if (!daySchedule) {
    throw new AppError(404, 'Schedule not found')
  }
  let avaiableSeat
  let qrCode

  if(seatNumber !== "standing"){


  let totalSeat = generateDefaultSeats(bus.seat)




  const time = daySchedule.departureTime

  // 2. Check if seat is already taken on this bus, date, time, and seatNumber
  const isSeatTaken = await Ticket.findOne({
    busNumber,
    date: new Date(date),
    source,
    destination,
    time: time
  });

  if (isSeatTaken) {
    totalSeat = isSeatTaken.avaiableSeat
    if(!totalSeat.includes(seatNumber.toString())){
      throw new AppError(400, 'Seat is already taken')
    }
  }
  const seatToRemove = seatNumber.toString(); // if seatNumber is like 'A3' or convert number to label if needed
   avaiableSeat = totalSeat.filter(seat => seat !== seatToRemove);


  const qrPayload = {
    busNumber,
    userName: req?.user?.name,
    time,        // e.g. "14:30"
    from: source,
    to: destination,
    date         // e.g. "2025-05-10"
  };
  
   qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));
}

  // Step 5: Create ticket
  const ticket = await Ticket.create({
    userId,
    schedule,
    price,
    validFor,
    seatNumber,
    busNumber,
    source,
    destination,
    date,
    time: daySchedule.departureTime,
    qrCode,
    key,
    avaiableSeat,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ticket created successfully',
    success: true,
    data: ticket,
  })
});


// export const applyStanding  = catchAsync( async(req,res)=>{


// })