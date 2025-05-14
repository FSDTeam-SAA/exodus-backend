"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoute = exports.updateRoute = exports.getRouteById = exports.getAllRoutes = exports.createRoute = void 0;
const http_status_1 = __importDefault(require("http-status"));
const route_model_1 = require("../models/route.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
// Create Route
exports.createRoute = (0, catchAsync_1.default)(async (req, res) => {
    const { bus_id, source, destination, departure_time, arrival_time, driver_id, price, totalSeat, avaiableSeat } = req.body;
    if (!bus_id || !source || !destination || !departure_time || !arrival_time || !driver_id || price === undefined || !totalSeat || !avaiableSeat) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'All fields are required');
    }
    const newRoute = await route_model_1.Route.create({ bus_id, source, destination, departure_time, arrival_time, driver_id, price, totalSeat, avaiableSeat });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Route created successfully',
        data: newRoute,
    });
});
// Get All Routes
exports.getAllRoutes = (0, catchAsync_1.default)(async (req, res) => {
    const routes = await route_model_1.Route.find();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All routes retrieved successfully',
        data: routes,
    });
});
// Get Single Route
exports.getRouteById = (0, catchAsync_1.default)(async (req, res) => {
    const route = await route_model_1.Route.findById(req.params.id);
    if (!route) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Route not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Route retrieved successfully',
        data: route,
    });
});
// Update Route
exports.updateRoute = (0, catchAsync_1.default)(async (req, res) => {
    const { bus_id, source, destination, departure_time, arrival_time, driver_id, price, totalSeat, avaiableSeat } = req.body;
    const updateData = {};
    if (bus_id !== undefined)
        updateData.bus_id = bus_id;
    if (source !== undefined)
        updateData.source = source;
    if (destination !== undefined)
        updateData.destination = destination;
    if (departure_time !== undefined)
        updateData.departure_time = departure_time;
    if (arrival_time !== undefined)
        updateData.arrival_time = arrival_time;
    if (driver_id !== undefined)
        updateData.driver_id = driver_id;
    if (price !== undefined)
        updateData.price = price;
    if (totalSeat !== undefined)
        updateData.TotalSeat = totalSeat;
    if (avaiableSeat !== undefined)
        updateData.avaiableSeat = avaiableSeat;
    const updatedRoute = await route_model_1.Route.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedRoute) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Route not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Route updated successfully',
        data: updatedRoute,
    });
});
// Delete Route
exports.deleteRoute = (0, catchAsync_1.default)(async (req, res) => {
    const route = await route_model_1.Route.findByIdAndDelete(req.params.id);
    if (!route) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Route not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Route deleted successfully',
        data: route,
    });
});
