import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import AppError from '../errors/AppError'
import { User } from '../models/user.model'
import httpStatus from "http-status";
import { Ticket } from '../models/ticket.model';



export const updateProfile = catchAsync(async (req, res) =>{
  const {name, email, password, phone, username } = req.body;
  const user = await User.findByIdAndUpdate({_id: req?.user?._id},{name,phone},{new:true});
  if(!user){
      throw new AppError(httpStatus.NOT_FOUND, 'User not found')
      }
    sendResponse(res,{
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile updated',
      data: user
    })

})



export const getUsers = catchAsync(async (req, res) => {
  // console.log("dasfdsf")
  const user = null
  if (!user) {
    throw new AppError(400, "user not found")
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Get all users',
    data: [],
  })
})



export const allRide = catchAsync(async (req, res) =>{
  if(!req.user?._id){
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized to access this route')
  }
  const ride = await Ticket.find({userId: req.user?._id})
  sendResponse(res,{
    statusCode: httpStatus.OK,
    success: true,
    message: 'Get all ride',
    data: ride
    })
})
