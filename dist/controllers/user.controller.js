"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allRide = exports.getUsers = exports.updateProfile = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_model_1 = require("../models/user.model");
const http_status_1 = __importDefault(require("http-status"));
const ticket_model_1 = require("../models/ticket.model");
exports.updateProfile = (0, catchAsync_1.default)(async (req, res) => {
    const { name, email, password, phone, username } = req.body;
    const user = await user_model_1.User.findByIdAndUpdate({ _id: req?.user?._id }, { name, phone }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Profile updated',
        data: user
    });
});
exports.getUsers = (0, catchAsync_1.default)(async (req, res) => {
    // console.log("dasfdsf")
    const user = null;
    if (!user) {
        throw new AppError_1.default(400, "user not found");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Get all users',
        data: [],
    });
});
exports.allRide = (0, catchAsync_1.default)(async (req, res) => {
    if (!req.user?._id) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized to access this route');
    }
    const ride = await ticket_model_1.Ticket.find({ userId: req.user?._id }).select("-avaiableSeat");
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Get all ride',
        data: ride
    });
});
