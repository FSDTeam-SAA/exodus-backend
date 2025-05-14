"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableBuses = exports.deleteBus = exports.updateBus = exports.getBusById = exports.getAllBuses = exports.createBus = void 0;
const http_status_1 = __importDefault(require("http-status"));
const bus_model_1 = require("../models/bus.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const schedule_model_1 = require("../models/schedule.model");
const ticket_model_1 = require("../models/ticket.model");
const bus_interface_1 = require("../interface/bus.interface");
// Create Bus
exports.createBus = (0, catchAsync_1.default)(async (req, res) => {
    const { name, bus_number, seat, standing, source, stops, lastStop, price } = req.body;
    if (!name || !bus_number || !seat || standing === undefined || source === undefined || stops === undefined || lastStop === undefined || price === undefined) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'All fields are required');
    }
    const newBus = await bus_model_1.Bus.create({ name, bus_number, seat, standing, source, stops, lastStop, price });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Bus created successfully',
        data: newBus,
    });
});
// Get All Buses with pagination and search
exports.getAllBuses = (0, catchAsync_1.default)(async (req, res) => {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
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
    const total = await bus_model_1.Bus.countDocuments(searchFilter);
    const buses = await bus_model_1.Bus.find(searchFilter).skip(skip).limit(limitNumber);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
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
exports.getBusById = (0, catchAsync_1.default)(async (req, res) => {
    const { source, destination, time, date } = req.query;
    if (!source || !destination || !time || !date) {
        throw new AppError_1.default(400, 'source, destination, time, and date are required');
    }
    const bus = await bus_model_1.Bus.findById(req.params.id);
    if (!bus) {
        throw new AppError_1.default(404, 'Bus not found');
    }
    const timeStr = time;
    const [hour, minute] = timeStr.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) {
        throw new AppError_1.default(400, 'Invalid time format');
    }
    const departureDateTime = new Date(date);
    departureDateTime.setHours(hour, minute, 0, 0);
    console.log(departureDateTime);
    const tickets = await ticket_model_1.Ticket.find({
        seatNumber: { $ne: "standing" },
        time,
        date: departureDateTime,
        busNumber: bus._id
    }).sort("-createdAt");
    console.log(tickets);
    const latestTicket = tickets[0]; // may be undefined
    const availableSeat = latestTicket?.avaiableSeat ?? (0, bus_interface_1.generateDefaultSeats)(bus.seat); // fallback if no tickets
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bus retrieved successfully',
        data: {
            bus,
            avaiableSeat: availableSeat
        },
    });
});
// Update Bus
exports.updateBus = (0, catchAsync_1.default)(async (req, res) => {
    const { name, bus_number, seat, standing, source, stops, lastStop, price } = req.body;
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (bus_number !== undefined)
        updateData.bus_number = bus_number;
    if (seat !== undefined)
        updateData.seat = seat;
    if (standing !== undefined)
        updateData.standing = standing;
    if (source !== undefined)
        updateData.source = source;
    if (stops !== undefined)
        updateData.stops = stops;
    if (lastStop !== undefined)
        updateData.lastStop = lastStop;
    if (price !== undefined)
        updateData.price = price;
    const updatedBus = await bus_model_1.Bus.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
    });
    if (!updatedBus) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Bus not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bus updated successfully',
        data: updatedBus,
    });
});
// Delete Bus
exports.deleteBus = (0, catchAsync_1.default)(async (req, res) => {
    const bus = await bus_model_1.Bus.findByIdAndDelete(req.params.id);
    // const schedule = await scheduler.findByIdAndDelete({bus:bus._id})
    if (!bus) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Bus not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bus deleted successfully',
        data: bus,
    });
});
exports.getAvailableBuses = (0, catchAsync_1.default)(async (req, res) => {
    const { from, to, date } = req.query;
    if (!from || !to || !date) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide from, to and date');
    }
    const travelDate = new Date(date);
    const today = new Date();
    const isToday = travelDate.toDateString() === today.toDateString();
    const dayOfWeek = travelDate.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Sun"
    const buses = await bus_model_1.Bus.find().lean();
    // Filter buses that go from `from` to `to`
    const matchingBuses = buses.filter((bus) => {
        const stopNames = bus.stops.map((s) => s.name);
        const fromIndex = stopNames.indexOf(from);
        const toIndex = stopNames.indexOf(to);
        return fromIndex !== -1 && toIndex !== -1;
    });
    const busIds = matchingBuses.map((bus) => bus._id);
    let schedules = await schedule_model_1.Schedule.find({
        busId: { $in: busIds },
        schedules: {
            $elemMatch: { day: dayOfWeek },
        },
    }).populate('busId');
    // Filter schedules if today and departure time has passed
    // if (isToday) {
    const currentTime = `${travelDate.getHours().toString().padStart(2, '0')}:${travelDate.getMinutes().toString().padStart(2, '0')}`;
    console.log(currentTime);
    schedules = schedules.filter(schedule => schedule.schedules.some((s) => s.day === dayOfWeek && s.departureTime > currentTime));
    // }
    // Map filtered schedules back to buses
    const filteredBuses = schedules.map(schedule => {
        const filteredSchedule = schedule.schedules.find((s) => s.day === dayOfWeek);
        return {
            ...schedule.toObject(),
            schedules: [filteredSchedule],
        };
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Buses available',
        data: filteredBuses
    });
});
