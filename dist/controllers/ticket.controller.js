"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelTicket = exports.getTicket = exports.scanTicket = exports.accpeteOrRejectStanding = exports.getAllTicket = exports.createTicket = void 0;
const ticket_model_1 = require("../models/ticket.model");
const user_model_1 = require("../models/user.model");
const qrcode_1 = __importDefault(require("qrcode"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const bus_model_1 = require("../models/bus.model");
const schedule_model_1 = require("../models/schedule.model");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const bus_interface_1 = require("../interface/bus.interface");
const generateOTP_1 = require("../utils/generateOTP");
const app_1 = require("../app");
const notifications_model_1 = require("../models/notifications.model");
exports.createTicket = (0, catchAsync_1.default)(async (req, res) => {
    const { seatNumber, busNumber, source, destination, date, } = req.body;
    const bus = await bus_model_1.Bus.findById(busNumber);
    if (!bus) {
        throw new AppError_1.default(404, 'Bus not found');
    }
    const stopNames = bus.stops.map((s) => s.name);
    const fromIndex = stopNames.indexOf(source);
    const toIndex = stopNames.indexOf(destination);
    if (fromIndex === -1 || toIndex === -1) {
        throw new AppError_1.default(404, 'Invalid source or destination');
    }
    const key = fromIndex < toIndex ? 'start' : 'end';
    // Step 3: Get the matching schedule by day
    const scheduleDoc = await schedule_model_1.Schedule.findOne({ busId: busNumber, isActive: true });
    // console.log(scheduleDoc);
    if (!scheduleDoc) {
        throw new AppError_1.default(404, 'Schedule not found');
    }
    const travelDate = new Date(date);
    let departureDateTime;
    const now = new Date();
    console.log(travelDate);
    const dayOfWeek = travelDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Sun"
    const daySchedule = scheduleDoc.schedules.find((s) => s.day === dayOfWeek);
    if (!daySchedule) {
        throw new AppError_1.default(404, 'Schedule not found');
    }
    // Check if the travel date is in the past
    if (travelDate.toDateString() < now.toDateString() ||
        (travelDate.toDateString() === now.toDateString() && daySchedule?.departureTime)) {
        // Parse departure time (assuming format is "HH:mm", e.g., "14:30")
        const [hour, minute] = daySchedule.departureTime.split(':').map(Number);
        departureDateTime = new Date(travelDate);
        departureDateTime.setHours(hour, minute, 0, 0);
        console.log(departureDateTime);
        if (departureDateTime < now) {
            throw new AppError_1.default(400, 'Cannot book ticket for past time');
        }
    }
    let avaiableSeat;
    let qrCode;
    const time = daySchedule.departureTime;
    // let status = "pending"
    if (seatNumber !== "standing") {
        let totalSeat = (0, bus_interface_1.generateDefaultSeats)(bus.seat);
        // 2. Check if seat is already taken on this bus, date, time, and seatNumber
        const isSeatTaken = await ticket_model_1.Ticket.find({
            busNumber,
            date: departureDateTime,
            time: time,
        }).sort("-createdAt");
        if (isSeatTaken) {
            totalSeat = isSeatTaken[0].avaiableSeat;
            if (!totalSeat.includes(seatNumber.toString())) {
                throw new AppError_1.default(400, 'Seat is already taken');
            }
        }
        const seatToRemove = seatNumber.toString(); // if seatNumber is like 'A3' or convert number to label if needed
        avaiableSeat = totalSeat.filter(seat => seat !== seatToRemove);
    }
    else if (seatNumber === "standing") {
        const avaiableStand = await ticket_model_1.Ticket.countDocuments({
            seatNumber: "standing", busNumber,
            date: departureDateTime,
            time: time,
        });
        if (avaiableStand >= bus.standing) {
            throw new AppError_1.default(400, 'Standing seat is already full');
        }
    }
    const qrOptions = {
        color: {
            dark: '#C0A05C', // QR color (e.g., blue)
            light: '#ffffff' // background color (e.g., light peach)
        }
    };
    const qrPayload = {
        code: (0, generateOTP_1.generateUniqueString)()
    };
    qrCode = await qrcode_1.default.toDataURL(JSON.stringify(qrPayload), qrOptions);
    //  status = "booked"
    // }
    // Step 5: Create ticket
    const ticket = await ticket_model_1.Ticket.create({
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
        key,
        avaiableSeat,
    });
    const notifications = await notifications_model_1.Notification.create({
        userId: req.user?._id,
        message: `Ticket for ${bus.name} has been booked successfully`,
        type: "success",
    });
    app_1.io.to(`user_${req.user?._id}`).emit(notifications.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Ticket created successfully',
        success: true,
        data: ticket,
    });
});
// Get All Ticket for A single Bus and a spacific time
exports.getAllTicket = (0, catchAsync_1.default)(async (req, res) => {
    const { busNumber, source, destination, date, time } = req.body;
    const [hour, minute] = time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) {
        throw new AppError_1.default(400, 'Invalid time format');
    }
    const departureDateTime = new Date(date);
    departureDateTime.setHours(hour, minute, 0, 0);
    const ticket = await ticket_model_1.Ticket.find({ busNumber, date: departureDateTime, time });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Ticket found',
        success: true,
        data: ticket
    });
});
exports.accpeteOrRejectStanding = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await ticket_model_1.Ticket.findById(id);
    if (!ticket) {
        throw new AppError_1.default(404, 'Ticket not found');
    }
    if (status === 'accepted') {
        const qrPayload = {
            busNumber: ticket.busNumber,
            userName: req?.user?.name,
            time: ticket.time, // e.g. "14:30"
            from: ticket.source,
            to: ticket.destination,
            date: ticket.date // e.g. "2025-05-10"
        };
        ticket.qrCode = await qrcode_1.default.toDataURL(JSON.stringify(qrPayload));
    }
    ticket.status = status;
    await ticket.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: `Standing Request ${status}`,
        success: true,
        data: ticket
    });
});
exports.scanTicket = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { secret, stationName } = req.body;
    const ticket = await ticket_model_1.Ticket.findById(id);
    if (!ticket) {
        throw new AppError_1.default(404, 'Ticket not found');
    }
    if (ticket.status === 'cancelled') {
        throw new AppError_1.default(400, 'Ticket is cancelled');
    }
    if (ticket.ticket_secret !== secret) {
        throw new AppError_1.default(401, 'Invalid QR code');
    }
    const qrOptions = {
        color: {
            dark: '#C0A05C', // QR color (e.g., blue)
            light: '#ffffff' // background color (e.g., light peach)
        }
    };
    const qrPayload = {
        code: (0, generateOTP_1.generateUniqueString)()
    };
    const qrCode = await qrcode_1.default.toDataURL(JSON.stringify(qrPayload), qrOptions);
    const bus = await bus_model_1.Bus.findOne({ _id: ticket.busNumber });
    if (ticket.status === 'running') {
        const stopNames = bus?.stops.map((s) => s.name);
        const fromIndex = stopNames?.indexOf(stationName) || 1;
        const toIndex = stopNames?.indexOf(ticket.destination) || 1;
        if (fromIndex > toIndex && ticket.key === 'start') {
            const userInfo = await user_model_1.User.findById(ticket.userId);
            if (userInfo) {
                userInfo.fine = userInfo?.fine + 15;
            }
        }
        ticket.status = "completed";
    }
    ticket.status = "running";
    ticket.qrCode = qrCode;
    const _ticket = await ticket.save();
    const notifications = await notifications_model_1.Notification.create({
        userId: _ticket.userId,
        message: `Congratulation You ${_ticket.status} the ${bus?.name} ride`,
        type: "success",
    });
    app_1.io.to(`user_${_ticket.userId}`).emit(notifications.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Ticket scanned successfully',
        data: _ticket
    });
});
// get All ticket for admin 
exports.getTicket = (0, catchAsync_1.default)(async (req, res) => {
    if (req.user?.role !== "admin") {
        throw new AppError_1.default(401, 'You are not authorized to access this route');
    }
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const total = await ticket_model_1.Ticket.countDocuments();
    const ticket = await ticket_model_1.Ticket.find().skip(skip).limit(limitNumber);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
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
exports.cancelTicket = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const ticket = await ticket_model_1.Ticket.findById(id);
    if (!ticket)
        throw new AppError_1.default(404, 'Ticket not found');
    if (ticket.status === 'cancelled')
        throw new AppError_1.default(400, 'Ticket already cancelled');
    const now = new Date();
    if (ticket.date && now < ticket.date) {
        const fine = ticket.price * 0.1;
        const refund = ticket.price - fine;
        const userId = await user_model_1.User.findById({ _id: ticket.userId });
        if (!userId) {
            throw new AppError_1.default(404, 'User not found');
        }
        // Update user credit
        userId.credit = (userId.credit || 0) + refund;
        userId.fine = (userId.fine || 0) + fine;
        await userId.save();
        // Mark ticket as cancelled
        ticket.status = 'cancelled';
        await ticket.save();
        const notifications = await notifications_model_1.Notification.create({
            userId: req.user?._id,
            message: `Cancelation successfully, cancellation fee equating to 10%`,
            type: "success",
        });
        app_1.io.to(`user_${req.user?._id}`).emit(notifications.message);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            message: 'Ticket cancelled',
            success: true,
            data: ticket
        });
    }
    throw new AppError_1.default(400, 'Cannot cancel ticket after departure time');
});
