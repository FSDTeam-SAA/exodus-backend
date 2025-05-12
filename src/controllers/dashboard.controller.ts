import { Request, Response } from 'express'
import { Ticket } from '../models/ticket.model'

export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          bookingCount: { $sum: 1 }, // Count total tickets
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
  