import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import AppError from '../errors/AppError'
import { Schedule } from '../models/schedule.model'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'

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
export const createSchedule = catchAsync(
  async (req, res) => {
    const { schedules, driverId, busId } = req.body 

    // Validate required fields
    if (!schedules || !driverId || !busId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Schedules, driverId, and busId are required'
      )
    }

    // Validate each schedule entry
    for (const schedule of schedules) {
      if (!schedule.day || !schedule.arrivalTime || !schedule.departureTime) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Each schedule must have day, arrivalTime, and departureTime'
        )
      }

      if (new Date(schedule.arrivalTime) >= new Date(schedule.departureTime)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Arrival time must be before departure time'
        )
      }
    }

    // Create new schedule
    const newSchedule = await Schedule.create({
      schedules,
      driverId,
      busId,
    })

    // Populate the references
    const populatedSchedule = await Schedule.findById(newSchedule._id)
      .populate('driverId',"email username name")
      .populate('busId', "name bus_number")

    // res.status(httpStatus.CREATED).json({
    //   success: true,
    //   message: 'Schedule created successfully',
    //   data: {
    //     schedule: populatedSchedule,
    //   },
    // })
    sendResponse(res,{
      statusCode: httpStatus.CREATED,
      message: 'Schedule created successfully',
      success: true,
      data: populatedSchedule,
        
    })
  }
)

// Get all schedules with populated fields
export const getAllSchedules = catchAsync(
  async (req, res) => {
    const schedules = await Schedule.find()
      .populate('driverId')
      .populate('busId')

    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: 'Schedules retrieved successfully',
    //   data: {
    //     schedules,
    //   },
    // })

    sendResponse(res,{
      statusCode: httpStatus.OK,
      message: 'Schedules retrieved successfully',
      success: true,
      data: schedules,
    })
  }
)

// Update a schedule
export const updateSchedule = catchAsync(
  async (req, res) => {
    const { id } = req.params
    const { schedules, driverId, busId } = req.body

    // Validate required fields
    if (!schedules || !driverId || !busId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Schedules, driverId, and busId are required'
      )
    }

    // Validate each schedule entry
    for (const schedule of schedules) {
      if (!schedule.day || !schedule.arrivalTime || !schedule.departureTime) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Each schedule must have day, arrivalTime, and departureTime'
        )
      }

      if (new Date(schedule.arrivalTime) >= new Date(schedule.departureTime)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Arrival time must be before departure time'
        )
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      {
        schedules,
        driverId,
        busId,
      },
      { new: true, runValidators: true }
    )
      .populate('driverId')
      .populate('busId')

    if (!updatedSchedule) {
      throw new AppError(httpStatus.NOT_FOUND, 'Schedule not found')
    }

    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: 'Schedule updated successfully',
    //   data: {
    //     schedule: updatedSchedule,
    //   },
    // })
    sendResponse(res,{
      statusCode: httpStatus.OK,
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    })
  }
)

// Delete a schedule
export const deleteSchedule = catchAsync(
  async (req, res) => {
    const { id } = req.params

    const deletedSchedule = await Schedule.findByIdAndDelete(id)

    if (!deletedSchedule) {
      throw new AppError(httpStatus.NOT_FOUND, 'Schedule not found')
    }

    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: 'Schedule deleted successfully',
    //   data: null,
    // })

    sendResponse(res,{
      statusCode: httpStatus.OK,
      success: true,
      message: 'Schedule deleted successfully',
      data: null
    })
  }
)
