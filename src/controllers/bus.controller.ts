import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Bus } from '../models/bus.model';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import AppError from '../errors/AppError';

// Create Bus
export const createBus = catchAsync(async (req, res) => {
  const { name, bus_number, seat, standing } = req.body;

  if (!name || !bus_number || !seat || standing === undefined) {
    throw new AppError(httpStatus.BAD_REQUEST, 'All fields are required');
  }

  const newBus = await Bus.create({ name, bus_number, seat, standing });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bus created successfully',
    data: newBus,
  });
});

// Get All Buses
export const getAllBuses = catchAsync(async (req, res) => {
  const buses = await Bus.find();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All buses retrieved successfully',
    data: buses,
  });
});

// Get Single Bus
export const getBusById = catchAsync(async (req, res) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus retrieved successfully',
    data: bus,
  });
});

// Update Bus
export const updateBus = catchAsync(async (req, res) => {
  const { name, bus_number, seat, standing } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (bus_number !== undefined) updateData.bus_number = bus_number;
  if (seat !== undefined) updateData.seat = seat;
  if (standing !== undefined) updateData.standing = standing;

  const updatedBus = await Bus.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  if (!updatedBus) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus updated successfully',
    data: updatedBus,
  });
});

// Delete Bus
export const deleteBus = catchAsync(async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);

  if (!bus) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bus not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bus deleted successfully',
    data: bus,
  });
});
