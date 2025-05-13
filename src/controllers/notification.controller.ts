import { Notification } from "../models/notifications.model";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

export const markAllAsRead = catchAsync(async(req,res)=>{
    const userId = req.user?.id;
    // const allNotifications = await Notification.find({user:userId});
    await Notification.updateMany({userId:userId},{read:true});
    sendResponse(res,{
        statusCode: httpStatus.OK,
        message: "All notifications marked as read",
        success: true,
        data: ""
    })   
})

export const getAllNotification = catchAsync(async(req,res)=>{
    const userId = req.user?.id;
    const allNotifications = await Notification.find({userId:userId}).sort({createdAt:-1});
    sendResponse(res,{
        statusCode: httpStatus.OK,
        message: "All notifications",
        success: true,
        data: allNotifications
        })
})