"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReservationsByUserId = exports.updateReservationStatus = exports.getAllReserveBuses = exports.cancelReservation = exports.createReserveBus = void 0;
const http_status_1 = __importDefault(require("http-status"));
const reserveBus_model_1 = require("../models/reserveBus.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_model_1 = require("../models/user.model");
const notifications_model_1 = require("../models/notifications.model");
const app_1 = require("../app");
// Create Reserve Bus
exports.createReserveBus = (0, catchAsync_1.default)(async (req, res) => {
    const { bus_number, time, day, price, totalHour, reservedBy, status } = req.body;
    if (!time ||
        !day ||
        price === undefined ||
        totalHour === undefined ||
        !reservedBy) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'All required fields must be provided');
    }
    // Find the user making the reservation
    const user = await user_model_1.User.findById(reservedBy).select('+credit'); // Ensure credit is selected
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // Check if user is a valid subscriber
    if (user.credit === null) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not a valid subscriber');
    }
    const newReservation = await reserveBus_model_1.ReserveBus.create({
        bus_number,
        time,
        day,
        price,
        totalHour,
        reservedBy,
        status,
    });
    const notifications = await notifications_model_1.Notification.create({
        userId: req.user?._id,
        message: `Bus Reserved Application Successfully Done`,
        type: "success",
    });
    app_1.io.to(`user_${req.user?._id}`).emit(notifications.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Bus reserved successfully',
        data: newReservation,
    });
});
// Update reservation status to "cancelled"
exports.cancelReservation = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const reservation = await reserveBus_model_1.ReserveBus.findById(id);
    if (!reservation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Reservation not found');
    }
    reservation.status = 'cancelled';
    await reservation.save();
    const notifications = await notifications_model_1.Notification.create({
        userId: reservation.reservedBy,
        message: `Your Bus Reserved Application Cancelled`,
        type: "success",
    });
    app_1.io.to(`user_${reservation.reservedBy}`).emit(notifications.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reservation status updated to cancelled',
        data: reservation,
    });
});
exports.getAllReserveBuses = (0, catchAsync_1.default)(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalItems = await reserveBus_model_1.ReserveBus.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);
    const reservations = await reserveBus_model_1.ReserveBus.find()
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .populate('reservedBy', 'name email'); // Optional: populate user info
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reserve bus data retrieved successfully',
        data: {
            reservations,
            meta: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
            },
        },
    });
});
// Update reservation status to "reserved"
exports.updateReservationStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const reservation = await reserveBus_model_1.ReserveBus.findById(id);
    if (!reservation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Reservation not found');
    }
    reservation.status = 'reserved';
    await reservation.save();
    const notifications = await notifications_model_1.Notification.create({
        userId: reservation.reservedBy,
        message: `Your Bus Reserved Application Approved`,
        type: "success",
    });
    app_1.io.to(`user_${reservation.reservedBy}`).emit(notifications.message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reservation status updated to reserved',
        data: reservation,
    });
});
// Get reservations by userId
exports.getReservationsByUserId = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User ID is required');
    }
    const reservations = await reserveBus_model_1.ReserveBus.find({ reservedBy: userId }).sort({
        createdAt: -1,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reservations retrieved successfully for the user',
        data: reservations,
    });
});
