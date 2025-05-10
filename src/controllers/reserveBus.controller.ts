import httpStatus from 'http-status'
import { ReserveBus } from '../models/reserveBus.model'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import AppError from '../errors/AppError'

// Create Reserve Bus
export const createReserveBus = catchAsync(async (req, res) => {
  const { bus_number, time, day, price, totalHour, reservedBy, status } =
    req.body

  if (
    !time ||
    !day ||
    price === undefined ||
    totalHour === undefined ||
    !reservedBy
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'All required fields must be provided'
    )
  }

  const newReservation = await ReserveBus.create({
    bus_number,
    time,
    day,
    price,
    totalHour,
    reservedBy,
    status,
  })

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bus reserved successfully',
    data: newReservation,
  })
})

// Update reservation status to "cancelled"
export const cancelReservation = catchAsync(async (req, res) => {
  const { id } = req.params

  const reservation = await ReserveBus.findById(id)

  if (!reservation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reservation not found')
  }

  reservation.status = 'canceled'
  await reservation.save()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation status updated to cancelled',
    data: reservation,
  })
})

export const getAllReserveBuses = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const totalItems = await ReserveBus.countDocuments()
  const totalPages = Math.ceil(totalItems / limit)

  const reservations = await ReserveBus.find()
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .populate('reservedBy', 'name email') // Optional: populate user info

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reserve bus data retrieved successfully',
    data: {
      reservations,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    },
  })
})

// Update reservation status to "reserved"
export const updateReservationStatus = catchAsync(async (req, res) => {
  const { id } = req.params

  const reservation = await ReserveBus.findById(id)

  if (!reservation) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reservation not found')
  }

  reservation.status = 'reserved'
  await reservation.save()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation status updated to reserved',
    data: reservation,
  })
})

// Get reservations by userId
export const getReservationsByUserId = catchAsync(async (req, res) => {
    const { userId } = req.params
  
    if (!userId) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User ID is required')
    }
  
    const reservations = await ReserveBus.find({ reservedBy: userId }).sort({
      createdAt: -1,
    })
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Reservations retrieved successfully for the user',
      data: reservations,
    })
  })
  