"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalUsers = exports.getBookingStats = void 0;
const ticket_model_1 = require("../models/ticket.model");
const user_model_1 = require("../models/user.model"); // Adjust the path as needed
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const getBookingStats = async (req, res) => {
    try {
        const stats = await ticket_model_1.Ticket.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    bookingCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    year: '$_id.year',
                    month: '$_id.month',
                    total: '$bookingCount',
                    _id: 0,
                },
            },
            { $sort: { year: 1, month: 1 } },
        ]);
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
exports.getBookingStats = getBookingStats;
exports.getTotalUsers = (0, catchAsync_1.default)(async (req, res) => {
    const totalUsers = await user_model_1.User.countDocuments();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Total user count retrieved successfully',
        data: { totalUsers },
    });
});
