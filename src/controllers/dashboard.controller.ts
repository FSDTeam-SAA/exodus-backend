import { Request, Response, NextFunction } from 'express';
import { Ticket } from '../models/ticket.model'
import {User} from '../models/user.model' // Adjust the path as needed
import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import sendResponse from '../utils/sendResponse';


export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const stats = await Ticket.aggregate([
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
    ])

    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error })
  }
}
  

export const getTotalUsers = catchAsync(async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Total user count retrieved successfully',
    data: { totalUsers },
  })
})