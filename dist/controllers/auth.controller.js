"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.verifyEmail = exports.resetPassword = exports.forgetPassword = exports.login = exports.register = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_model_1 = require("../models/user.model");
const authToken_1 = require("../utils/authToken");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const generateOTP_1 = require("../utils/generateOTP");
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const ticket_model_1 = require("../models/ticket.model");
const sendEmail_1 = require("../utils/sendEmail");
exports.register = (0, catchAsync_1.default)(async (req, res) => {
    const { name, email, password, phone, username } = req.body;
    if (!name || !email || !password || !username) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Please fill in all fields');
    }
    const otp = (0, generateOTP_1.generateOTP)();
    const jwtPayloadOTP = {
        otp: otp,
    };
    const otptoken = (0, authToken_1.createToken)(jwtPayloadOTP, process.env.OTP_SECRET, process.env.OTP_EXPIRE);
    const user = await user_model_1.User.create({ name, email, password, phone, username, verificationInfo: { token: otptoken } });
    (0, sendEmail_1.sendEmail)(user.email, 'Registerd Account', `Your OTP is ${otp}`);
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
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User Logged in successfully',
        data: user,
    });
});
exports.login = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    // console.log(await User.isPasswordMatched(password.toString(), user.password))
    if (user?.password && !(await user_model_1.User.isPasswordMatched(password, user.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Password is not correct');
    }
    if (!await user_model_1.User.isOTPVerified(user._id)) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'OTP is not verified');
    }
    let ticket;
    // if(user.role !== "admin" && user.role !== "driver"){
    ticket = await ticket_model_1.Ticket.find({
        userId: user._id, ride: "pending",
        $or: [
            { status: "accpeted" },
            { status: "booked" }
        ]
    }).select("-avaiableSeat");
    // }
    const jwtPayload = {
        _id: user._id,
        email: user.email,
        role: user.role,
    };
    const accessToken = (0, authToken_1.createToken)(jwtPayload, process.env.JWT_ACCESS_SECRET, process.env.JWT_ACCESS_EXPIRES_IN);
    const refreshToken = (0, authToken_1.createToken)(jwtPayload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN);
    res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User Logged in successfully',
        data: { accessToken, user, ticket },
    });
});
exports.forgetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const otp = (0, generateOTP_1.generateOTP)();
    const otptoken = (0, authToken_1.createToken)(otp, process.env.OTP_SECRET, '1h');
    user.password_reset_token = otptoken;
    await user.save();
    /////// TODO: SENT EMAIL MUST BE DONE
    (0, sendEmail_1.sendEmail)(user.email, 'Reset Password', `Your OTP is ${otp}`);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'OTP sent to your email',
        data: ""
    });
});
exports.resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { password, otp, email } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!user.password_reset_token) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password reset token is invalid');
    }
    const verify = await (0, authToken_1.verifyToken)(user.password_reset_token, process.env.OTP_SECRET);
    if (verify.otp !== otp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
    }
    user.password = password;
    await user.save();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password reset successfully',
        data: {}
    });
});
exports.verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    const { email, otp } = req.body;
    const user = await user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.verificationInfo.verified) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User already verified');
    }
    if (otp) {
        const savedOTP = (0, authToken_1.verifyToken)(user.verificationInfo.token, process.env.OTP_SECRET || "");
        console.log(savedOTP);
        if (otp === savedOTP.otp) {
            user.verificationInfo.verified = true;
            user.verificationInfo.token = "";
            await user.save();
            (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: 'User verified',
                data: ""
            });
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid OTP');
        }
    }
    else {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OTP is required');
    }
});
exports.changePassword = (0, catchAsync_1.default)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Old password and new password are required');
    }
    if (oldPassword === newPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Old password and new password cannot be same');
    }
    const user = await user_model_1.User.findByIdAndUpdate({ _id: req.user?._id }, { password: newPassword }, { new: true });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password changed',
        data: ""
    });
});
