import { Request, Response, NextFunction } from 'express'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import AppError from '../errors/AppError'

// export const getUsers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     res.json({ message: 'Get all users' })
//   } catch (err) {
//     next(err)
//   }
// }

export const getUsers = catchAsync(async(req,res)=>{
  const user = null
  if(!user){
    throw new AppError(400, "user not found")
  }
  sendResponse(res,{
    statusCode: 200,
    success: true,
    message: 'Get all users',
    data: [],
  })
})
