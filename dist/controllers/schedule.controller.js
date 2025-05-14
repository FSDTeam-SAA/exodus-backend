"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleScheduleStatus = exports.deleteSchedule = exports.updateSchedule = exports.getAllSchedules = exports.createSchedule = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const schedule_model_1 = require("../models/schedule.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// interface IScheduleRequestBody {
//   schedules: Array<{
//     day: string
//     arrivalTime: Date
//     departureTime: Date
//   }>
//   driverId: string
//   busId: string
// }
// Create a new schedule
exports.createSchedule = (0, catchAsync_1.default)(async (req, res) => {
    const { schedules, driverId, busId } = req.body;
    // Validate required fields
    if (!schedules || !driverId || !busId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Schedules, driverId, and busId are required');
    }
    // Validate each schedule entry
    for (const schedule of schedules) {
        if (!schedule.day || !schedule.arrivalTime || !schedule.departureTime) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Each schedule must have day, arrivalTime, and departureTime');
        }
        if (new Date(schedule.arrivalTime) >= new Date(schedule.departureTime)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Arrival time must be before departure time');
        }
    }
    // Create new schedule
    const newSchedule = await schedule_model_1.Schedule.create({
        schedules,
        driverId,
        busId,
    });
    // Populate the references
    const populatedSchedule = await schedule_model_1.Schedule.findById(newSchedule._id)
        .populate('driverId', "email username name")
        .populate('busId', "name bus_number");
    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   message: 'Schedule created successfully',
    //   data: {
    //     schedule: populatedSchedule,
    //   },
    // })
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        message: 'Schedule created successfully',
        success: true,
        data: populatedSchedule,
    });
});
// Get all schedules with populated fields
exports.getAllSchedules = (0, catchAsync_1.default)(async (req, res) => {
    const schedules = await schedule_model_1.Schedule.find()
        .populate('driverId')
        .populate('busId');
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: 'Schedules retrieved successfully',
    //   data: {
    //     schedules,
    //   },
    // })
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'Schedules retrieved successfully',
        success: true,
        data: schedules,
    });
});
// Update a schedule
exports.updateSchedule = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { schedules, driverId, busId } = req.body;
    // Validate required fields
    if (!schedules || !driverId || !busId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Schedules, driverId, and busId are required');
    }
    // Validate each schedule entry
    for (const schedule of schedules) {
        if (!schedule.day || !schedule.arrivalTime || !schedule.departureTime) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Each schedule must have day, arrivalTime, and departureTime');
        }
        if (new Date(schedule.arrivalTime) >= new Date(schedule.departureTime)) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Arrival time must be before departure time');
        }
    }
    const updatedSchedule = await schedule_model_1.Schedule.findByIdAndUpdate(id, {
        schedules,
        driverId,
        busId,
    }, { new: true, runValidators: true })
        .populate('driverId')
        .populate('busId');
    if (!updatedSchedule) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Schedule not found');
    }
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: 'Schedule updated successfully',
    //   data: {
    //     schedule: updatedSchedule,
    //   },
    // })
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Schedule updated successfully',
        data: updatedSchedule
    });
});
// Delete a schedule
exports.deleteSchedule = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const deletedSchedule = await schedule_model_1.Schedule.findByIdAndDelete(id);
    if (!deletedSchedule) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Schedule not found');
    }
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: 'Schedule deleted successfully',
    //   data: null,
    // })
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Schedule deleted successfully',
        data: null
    });
});
exports.toggleScheduleStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const schedule = await schedule_model_1.Schedule.findById(id);
    if (!schedule) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Schedule not found');
    }
    schedule.isActive = !schedule.isActive;
    await schedule.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Schedule is now ${schedule.isActive ? 'active' : 'inactive'}`,
        data: schedule,
    });
});
