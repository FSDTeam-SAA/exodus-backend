"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllNotification = exports.markAllAsRead = void 0;
const notifications_model_1 = require("../models/notifications.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
exports.markAllAsRead = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id;
    // const allNotifications = await Notification.find({user:userId});
    await notifications_model_1.Notification.updateMany({ userId: userId }, { read: true });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: "All notifications marked as read",
        success: true,
        data: ""
    });
});
exports.getAllNotification = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const allNotifications = await notifications_model_1.Notification.find({ userId: userId }).sort({ createdAt: -1 });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: "All notifications",
        success: true,
        data: allNotifications
    });
});
