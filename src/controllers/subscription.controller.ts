import httpStatus from 'http-status'
import { Subscription } from '../models/subscription.model'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import AppError from '../errors/AppError'

// Create Subscription
export const createSubscription = catchAsync(async (req, res) => {
  const { planName, roundtrip, price, planValid } = req.body

  if (!planName || roundtrip === undefined || price === undefined) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'planName, roundtrip and price are required'
    )
  }

  const newSubscription = await Subscription.create({
    planName,
    roundtrip,
    price,
    planValid,
  })

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Subscription created successfully',
    data: newSubscription,
  })
})

// Update Subscription
export const updateSubscription = catchAsync(async (req, res) => {
  const { id } = req.params
  const updatedData = req.body

  const updatedSubscription = await Subscription.findByIdAndUpdate(
    id,
    updatedData,
    { new: true }
  )

  if (!updatedSubscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription updated successfully',
    data: updatedSubscription,
  })
})

// Get All Subscriptions
export const getAllSubscriptions = catchAsync(async (req, res) => {
  const subscriptions = await Subscription.find()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All subscriptions fetched successfully',
    data: subscriptions,
  })
})

// Get Single Subscription
export const getSingleSubscription = catchAsync(async (req, res) => {
  const { id } = req.params

  const subscription = await Subscription.findById(id)

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription fetched successfully',
    data: subscription,
  })
})

// Delete Subscription
export const deleteSubscription = catchAsync(async (req, res) => {
  const { id } = req.params

  const deleted = await Subscription.findByIdAndDelete(id)

  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription deleted successfully',
    data: deleted,
  })
})
