import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import AppError from '../errors/AppError'
import { User } from '../models/user.model'
import catchAsync from '../utils/catchAsync'
import { uploadToCloudinary } from '../utils/cloudinary'

interface IDriverRequestBody {
  name: string
  email: string
  phone?: string
  password: string
  username?: string
}
// create driver
export const addDriver = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone, password, username } =
    req.body as IDriverRequestBody

  // Validate required fields
  if (!name || !email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Name, email, and password are required'
    )
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please provide a valid email address'
    )
  }

  // Validate password strength
  if (password.length < 6) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password must be at least 6 characters long'
    )
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User with this email already exists'
    )
  }

  // Handle image upload if present
  let avatar
  if (req.file) {
    try {
      const cloudinaryResponse = await uploadToCloudinary(req.file.path)
      if (!cloudinaryResponse) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Failed to upload image to Cloudinary'
        )
      }
      avatar = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      }
    } catch (error) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error processing image upload'
      )
    }
  }

  // Generate username if not provided
  const generatedUsername = username || email.split('@')[0]

  // Create new driver
  const newDriver = await User.create({
    name,
    email,
    phone: phone || undefined,
    password,
    username: generatedUsername,
    avatar,
    role: 'driver',
  })

  // Remove sensitive data before sending response
  const driverResponse = { ...newDriver.toObject() }
  delete (driverResponse as any).password
  delete (driverResponse as any).password_reset_token
  delete (driverResponse as any).verificationInfo

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Driver created successfully',
    data: {
      driver: driverResponse,
    },
  })
})

// get all the drivers
export const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const drivers = await User.find({ role: 'driver' }).select('-password -password_reset_token -verificationInfo')

  if (!drivers || drivers.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No drivers found')
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Drivers fetched successfully',
    data: {
      drivers,
    },
  })
})