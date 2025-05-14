"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscription = exports.getSingleSubscription = exports.getAllSubscriptions = exports.updateSubscription = exports.createSubscription = void 0;
const http_status_1 = __importDefault(require("http-status"));
const subscription_model_1 = require("../models/subscription.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
// Create Subscription
exports.createSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const { planName, roundtrip, price, planValid } = req.body;
    if (!planName || roundtrip === undefined || price === undefined) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'planName, roundtrip and price are required');
    }
    const newSubscription = await subscription_model_1.Subscription.create({
        planName,
        roundtrip,
        price,
        planValid,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Subscription created successfully',
        data: newSubscription,
    });
});
// Update Subscription
exports.updateSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedSubscription = await subscription_model_1.Subscription.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedSubscription) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Subscription not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription updated successfully',
        data: updatedSubscription,
    });
});
// Get All Subscriptions
exports.getAllSubscriptions = (0, catchAsync_1.default)(async (req, res) => {
    const subscriptions = await subscription_model_1.Subscription.find();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All subscriptions fetched successfully',
        data: subscriptions,
    });
});
// Get Single Subscription
exports.getSingleSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const subscription = await subscription_model_1.Subscription.findById(id);
    if (!subscription) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Subscription not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription fetched successfully',
        data: subscription,
    });
});
// Delete Subscription
exports.deleteSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const deleted = await subscription_model_1.Subscription.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Subscription not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription deleted successfully',
        data: deleted,
    });
});
