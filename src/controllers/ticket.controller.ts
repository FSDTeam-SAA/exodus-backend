import { Request, Response, NextFunction } from 'express'
import { Ticket } from '../models/ticket.model'
import { User } from '../models/user.model'
import QRCode from 'qrcode'
import AppError from '../errors/AppError'

export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, routeId, price, busNumber, seatNumber, validFor } = req.body

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Check user credit
    if (user.credit < price) {
      throw new AppError(400, 'Insufficient credit')
    }

    // Generate QR Code data
    const qrData = JSON.stringify({
      userId,
      routeId,
      busNumber,
      seatNumber,
      validFor,
    })
    const qrCode = await QRCode.toDataURL(qrData)

    // Create ticket
    const ticket = await Ticket.create({
      userId,
      routeId,
      price,
      busNumber,
      seatNumber,
      qrCode,
      validFor,
    })

    // Deduct credit
    user.credit -= price
    await user.save()

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    })
  } catch (err) {
    next(err)
  }
}
