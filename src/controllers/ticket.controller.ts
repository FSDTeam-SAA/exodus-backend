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
    seatNumber,
    busNumber,
    source,
    destination,
    date,
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
  const scheduleDoc = await Schedule.findOne({busId: busNumber});
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

  // Check if the travel date is in the past
if (
  travelDate.toDateString() < now.toDateString() || 
  (travelDate.toDateString() === now.toDateString() && daySchedule?.departureTime)
) {
  // Parse departure time (assuming format is "HH:mm", e.g., "14:30")
  const [hour, minute] = daySchedule.departureTime.split(':').map(Number);
  departureDateTime = new Date(travelDate);
  departureDateTime.setHours(hour, minute, 0, 0);
  console.log(departureDateTime)

  if (departureDateTime < now) {
    throw new AppError(400, 'Cannot book ticket for past time');
  }
}
  let avaiableSeat
  let qrCode
  let status = "pending"

  if(seatNumber !== "standing"){


  let totalSeat = generateDefaultSeats(bus.seat)




  const time = daySchedule.departureTime

  // 2. Check if seat is already taken on this bus, date, time, and seatNumber
  const isSeatTaken = await Ticket.findOne({
    busNumber,
    date: departureDateTime,
    source,
    destination,
    time: time,
    status: "booked"
  }).sort("-createdAt");

  if (isSeatTaken) {
    totalSeat = isSeatTaken.avaiableSeat
    if(!totalSeat.includes(seatNumber.toString())){
      throw new AppError(400, 'Seat is already taken')
    }
  }
  const seatToRemove = seatNumber.toString(); // if seatNumber is like 'A3' or convert number to label if needed
   avaiableSeat = totalSeat.filter(seat => seat !== seatToRemove);

   const qrOptions = {
  color: {
    dark: '#C0A05C',   // QR color (e.g., blue)
    light: '#ffffff'   // background color (e.g., light peach)
  }
};

  const qrPayload = {
    busNumber,
    userName: req?.user?.name,
    time,        // e.g. "14:30"
    from: source,
    to: destination,
    date         // e.g. "2025-05-10"
  };
  
   qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload),qrOptions);
   status = "booked"
}

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
    qrCode,
    status,
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



export const getAllTicket = catchAsync(async(req,res)=>{
  const {busNumber,source,destination,date, time} = req.body;
  const ticket = await Ticket.find({busNumber,source,destination,date,time});
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Ticket found',
    success: true,
    data: ticket
    })
})

export const accpeteStanding = catchAsync(async(req,res)=>{
  const {id} = req.params;
  const ticket = await Ticket.findById(id)
  if(!ticket) {
    throw new AppError( 404, 'Ticket not found')
    }
    const qrPayload = {
      busNumber: ticket.busNumber,
      userName: req?.user?.name,
      time: ticket.time,        // e.g. "14:30"
      from: ticket.source,
      to: ticket.destination,
      date: ticket.date         // e.g. "2025-05-10"
    };
    
     ticket.qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload));
     ticket.status = "accpeted";
     await ticket.save();
     sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Standing Request accpeted',
      success: true,
      data: ticket
      })

})



