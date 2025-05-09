import httpStatus from 'http-status';
import { Route } from '../models/route.model';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import AppError from '../errors/AppError';

// Create Route
export const createRoute = catchAsync(async (req, res) => {
  const { bus_id, source, destination, departure_time, arrival_time, driver_id, price, totalSeat, avaiableSeat } = req.body;

  if (!bus_id || !source || !destination || !departure_time || !arrival_time || !driver_id || price === undefined || !totalSeat || !avaiableSeat) {
    throw new AppError(httpStatus.BAD_REQUEST, 'All fields are required');
  }

  const newRoute = await Route.create({ bus_id, source, destination, departure_time, arrival_time, driver_id, price, totalSeat, avaiableSeat });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Route created successfully',
    data: newRoute,
  });
});

// Get All Routes
export const getAllRoutes = catchAsync(async (req, res) => {
  const routes = await Route.find();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All routes retrieved successfully',
    data: routes,
  });
});

// Get Single Route
export const getRouteById = catchAsync(async (req, res) => {
  const route = await Route.findById(req.params.id);

  if (!route) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route retrieved successfully',
    data: route,
  });
});

// Update Route
export const updateRoute = catchAsync(async (req, res) => {
  const { bus_id, source, destination, departure_time, arrival_time, driver_id, price, totalSeat, avaiableSeat } = req.body;

  const updateData: any = {};
  if (bus_id !== undefined) updateData.bus_id = bus_id;
  if (source !== undefined) updateData.source = source;
  if (destination !== undefined) updateData.destination = destination;
  if (departure_time !== undefined) updateData.departure_time = departure_time;
  if (arrival_time !== undefined) updateData.arrival_time = arrival_time;
  if (driver_id !== undefined) updateData.driver_id = driver_id;
  if (price !== undefined) updateData.price = price;
  if (totalSeat !== undefined) updateData.TotalSeat = totalSeat;
  if (avaiableSeat !== undefined) updateData.avaiableSeat = avaiableSeat;

  const updatedRoute = await Route.findByIdAndUpdate(req.params.id, updateData, { new: true });

  if (!updatedRoute) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route updated successfully',
    data: updatedRoute,
  });
});

// Delete Route
export const deleteRoute = catchAsync(async (req, res) => {
  const route = await Route.findByIdAndDelete(req.params.id);

  if (!route) {
    throw new AppError(httpStatus.NOT_FOUND, 'Route not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Route deleted successfully',
    data: route,
  });
});
