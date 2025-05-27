import type { Request, Response } from 'express'
import httpStatus from 'http-status'
import AppError from '../errors/AppError'
import { User } from '../models/user.model'
import catchAsync from '../utils/catchAsync'
import { uploadToCloudinary } from '../utils/cloudinary'
import { Schedule } from '../models/schedule.model'
import sendResponse from '../utils/sendResponse'
import { Ticket } from '../models/ticket.model'

// interface IDriverRequestBody {
//   name: string
//   email: string
//   phone?: string
//   password: string
//   username?: string
// }
// create driver
export const addDriver = catchAsync(async (req, res) => {
  const { name, email, phone, password, username } = req.body

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
    verificationInfo: {
      verified: true
    },
    avatar,
    role: 'driver',
  })

  // Remove sensitive data before sending response
  const driverResponse = { ...newDriver.toObject() }
  delete (driverResponse as any).password
  delete (driverResponse as any).password_reset_token
  delete (driverResponse as any).verificationInfo

  // res.status(httpStatus.CREATED).json({
  //   success: true,
  //   message: 'Driver created successfully',
  //   data: {
  //     driver: driverResponse,
  //   },
  // })
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Driver created successfully',
    data: driverResponse
  })
})

// get all the drivers
export const getAllDrivers = catchAsync(async (req, res) => {
  const { page = '1', limit = '10', search = '' } = req.query;

  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  // Build search filter
  const searchFilter = search
    ? {
      role: 'driver',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ],
    }
    : { role: 'driver', };

  const total = await User.countDocuments(searchFilter);

  const drivers = await User.find(searchFilter).select('-password -password_reset_token -verificationInfo -refreshToken').skip(skip).limit(limitNumber).sort({ createdAt: -1 })

  if (!drivers || drivers.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No drivers found')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Drivers retrieved successfully',
    data: {
      drivers,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    }
  })
})

// update driver info
export const updateDriver = catchAsync(async (req, res) => {
  const { id, name, email, phone, username } = req.body

  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Driver ID is required')
  }

  const driver = await User.findOne({ _id: id, role: 'driver' })

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver not found')
  }

  // Update only basic info (not password)
  driver.name = name || driver.name
  driver.email = email || driver.email
  if (phone !== undefined) {
    (driver as any).phone = phone
  }
  driver.username = username || driver.username

  await driver.save()

  const updatedDriver = driver.toObject()
  delete (updatedDriver as any).password
  delete (updatedDriver as any).password_reset_token
  delete (updatedDriver as any).verificationInfo

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Driver updated successfully',
    data: updatedDriver
  })
})

// delete driver
export const deleteDriver = catchAsync(async (req, res) => {
  const driverId = req.params.id

  const driver = await User.findOneAndDelete({ _id: driverId, role: 'driver' })

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, 'Driver not found or already deleted')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Driver deleted successfully',
    data: ""
  })
})



export const driverScheduledTrips = catchAsync(async (req, res) => {
  const driverId = req.user?._id;

  if (!driverId) {
    throw new AppError(401, 'Unauthorized');
  }

  const now = new Date("2025-05-28T08:00:00");

  // Day like 'Mon', 'Tue', etc.
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = dayNames[now.getDay()];

  const schedules = await Schedule.find({ driverId, isActive: true }).populate('busId');
  // console.log( 'schedules', schedules );

  const currentTrips: any[] = [];
  const upcomingTrips: any[] = [];

  for (const schedule of schedules) {
    for (const daySchedule of schedule.schedules) {
      if (daySchedule.day !== currentDay) continue; // Skip if not today

      const [depHour, depMin] = daySchedule.departureTime.split(':').map(Number);
      const departureTime = new Date(now);
      departureTime.setHours(depHour, depMin, 0, 0);

      const [arrHour, arrMin] = daySchedule.arrivalTime
        ? daySchedule.arrivalTime.split(':').map(Number)
        : [depHour + 1, depMin];

      const arrivalTime = new Date(now);
      arrivalTime.setHours(arrHour, arrMin, 0, 0);

      const bus: any = schedule.busId;
      const toltalStand =  await Ticket.countDocuments({busNumber: bus._id, date: departureTime, seatNumber: "standing" });
      const toltalSeat =  await Ticket.countDocuments({busNumber: bus._id, date: departureTime, seatNumber: {$ne:"standing"} });

      const tripInfo = {
        day: daySchedule.day,
        departureTime: daySchedule.departureTime,
        arrivalTime: daySchedule.arrivalTime,
        source: bus.source,
        destination: bus.lastStop,
        busName: bus.name,
        busNumber: bus.bus_number,
        totalSeat: bus.seat,
        totalStanding: bus.standing,
        totalSeatBooked: toltalSeat,
        totalStandingBooked: toltalStand,
        busId: bus._id,
        date: departureTime,
      };
      // console.log( departureTime, "dsjfhdshfjsdkjsdfhkshkjsdhsdfkjh", now );


      
      // console.log ( 'toltalSeat', toltalSeat );
      upcomingTrips.push(tripInfo);
    }
  }


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Trips found',
    data: upcomingTrips
  })
});


