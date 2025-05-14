import AppError from "../errors/AppError";
import { User } from "../models/user.model";
import { createToken, verifyToken } from "../utils/authToken";
import catchAsync from "../utils/catchAsync";
import { generateOTP } from "../utils/generateOTP";
import httpStatus from "http-status";
import sendResponse from "../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { Ticket } from "../models/ticket.model";
import { sendEmail } from "../utils/sendEmail";


export const register = catchAsync(async (req, res) => {
    const { name, email, password, phone,username } = req.body;
    if (!name || !email || !password ) {
        throw new AppError(httpStatus.FORBIDDEN, 'Please fill in all fields')
    }
    const otp = generateOTP()
    const jwtPayloadOTP = {
        otp: otp,
    };

    const otptoken = createToken(jwtPayloadOTP,
        process.env.OTP_SECRET as string,
        process.env.OTP_EXPIRE,
    )
    const generatedUsername = username || email.split('@')[0]

    const user = await User.create({ name, email, password, phone, username: generatedUsername, verificationInfo: { token: otptoken } })
    await sendEmail(user.email, 'Registerd Account', `Your OTP is ${otp}`)
    // create token and sent to the client

    // const jwtPayload = {
    //     _id: user._id,
    //     email: user.email,
    //     role: user.role,
    // };
    // const accessToken = createToken(
    //     jwtPayload,
    //     process.env.JWT_ACCESS_SECRET as string,
    //     process.env.JWT_ACCESS_EXPIRES_IN as string,
    // );

    // const refreshToken = createToken(
    //     jwtPayload,
    //     process.env.JWT_REFRESH_SECRET as string,
    //     process.env.JWT_REFRESH_EXPIRES_IN as string,
    // );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User Logged in successfully',
        data: user,
    });
})


export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.isUserExistsByEmail(email)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }
    // console.log(await User.isPasswordMatched(password.toString(), user.password))
    if (user?.password && !(await User.isPasswordMatched(password, user.password))) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password is not correct');
    }
    if (! await User.isOTPVerified(user._id)) {
        throw new AppError(httpStatus.FORBIDDEN, 'OTP is not verified')
    }
    let ticket;
    // if(user.role !== "admin" && user.role !== "driver"){

    ticket = await Ticket.find({
        userId: user._id, ride: "pending",
        $or: [
            { status: "accpeted" },
            { status: "booked" }
        ]
    }).select("-avaiableSeat")
    // }
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

    user.refreshToken = refreshToken;
    let _user =await user.save()

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
        data: { accessToken, user: _user, ticket},
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
    sendEmail(user.email, 'Reset Password', `Your OTP is ${otp}`)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'OTP sent to your email',
        data: ""
    })
})

export const resetPassword = catchAsync(async (req, res) => {
    const { password, otp,email } = req.body;
    const user = await User.isUserExistsByEmail(email)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }
    if (!user.password_reset_token) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Password reset token is invalid')
    }
    const verify = await verifyToken(user.password_reset_token, process.env.OTP_SECRET!) as JwtPayload
    if (verify.otp !== otp) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP')
    }
    user.password = password
    await user.save()
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password reset successfully',
        data: {}
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
        const savedOTP = verifyToken(user.verificationInfo.token, process.env.OTP_SECRET || "") as JwtPayload
        console.log(savedOTP)
        if (otp === savedOTP.otp) {
            user.verificationInfo.verified = true
            user.verificationInfo.token = ""
            await user.save()

            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: 'User verified',
                data: ""
            })


        } else {
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid OTP')
        }
    } else {
        throw new AppError(httpStatus.BAD_REQUEST, 'OTP is required')
    }
})

export const changePassword = catchAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Old password and new password are required')
    }
    if (oldPassword === newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Old password and new password cannot be same')
    }
    const user = await User.findByIdAndUpdate({ _id: req.user?._id }, { password: newPassword }, { new: true })
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found')
    }
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password changed',
        data: ""
    })
})

// Refresh Token
export const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError(400, 'Refresh token is required');
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
        throw new AppError(401, 'Invalid refresh token');
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

    const refreshToken1 = createToken(
        jwtPayload,
        process.env.JWT_REFRESH_SECRET as string,
        process.env.JWT_REFRESH_EXPIRES_IN as string,
    );
    user.refreshToken = refreshToken1;
    await user.save();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken: accessToken, refreshToken: refreshToken1 },
    });
});



