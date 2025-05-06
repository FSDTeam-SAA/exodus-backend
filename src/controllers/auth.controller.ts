import AppError from "../errors/AppError";
import { User } from "../models/user.model";
import { createToken, verifyToken } from "../utils/authToken";
import catchAsync from "../utils/catchAsync";
import { generateOTP } from "../utils/generateOTP";
import httpStatus from "http-status";
import sendResponse from "../utils/sendResponse";


export const register = catchAsync(async (req, res) => {
    const { name, email, password, phone, username } = req.body;
    if (!name || !email || !password || !username) {
        throw new AppError(httpStatus.FORBIDDEN, 'Please fill in all fields')
    }
    const otp = generateOTP()

    const otptoken = createToken(otp,
        process.env.OTP_SECRET as string,
        '1h' as string,
    )

    const user = await User.create({ name, email, password, phone, username, verificationInfo: { token: otptoken } })

    // create token and sent to the client

    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = createToken(
        jwtPayload,
        process.env.JWT_ACCESS_SECRET as string,
        process.env.JWT_ACCESS_EXPIRES_IN as string,
    );

    const refreshToken = createToken(
        jwtPayload,
        process.env.JWT_REFRESH_SECRET as string,
        process.env.JWT_REFRESH_EXPIRES_IN as string,
    );

    res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User Logged in successfully',
        data: { accessToken, user },
    });
})


export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.isUserExistsByEmail(email)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }
    if (user?.password && !(await User.isPasswordMatched(password, user.password))) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password is not correct');
    }
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = createToken(
        jwtPayload,
        process.env.JWT_ACCESS_SECRET as string,
        process.env.JWT_ACCESS_EXPIRES_IN as string,
    );

    const refreshToken = createToken(
        jwtPayload,
        process.env.JWT_REFRESH_SECRET as string,
        process.env.JWT_REFRESH_EXPIRES_IN as string,
    );

    res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User Logged in successfully',
        data: { accessToken, user },
    });



})

export const forgetPassword = catchAsync(async (req, res) => {
    const { email } = req.body;
    const user = await User.isUserExistsByEmail(email)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }
    const otp = generateOTP()

    const otptoken = createToken(otp,
        process.env.OTP_SECRET as string,
        '1h' as string,
    )
    user.password_reset_token = otptoken
    await user.save()

    /////// TODO: SENT EMAIL MUST BE DONE

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OTP sent to your email',
        data: ""
    })
})

export const verifyEmail = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.isUserExistsByEmail(email)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }
    if (user.verificationInfo.verified) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already verified')
    }
    if (otp) {
        const savedOTP = verifyToken(user.verificationInfo.token, process.env.OTP_SECRET || "")
        if (otp === savedOTP) {
            user.verificationInfo.verified = true
            user.verificationInfo.token = ""
            await user.save()
            
            sendResponse(res,{
                statusCode: httpStatus.OK,
                success: true,
                message: 'User verified',
                data: ""
            })


        }else{
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP')
        }
    }else{
        throw new AppError(httpStatus.BAD_REQUEST, 'OTP is required')
    }
})



