"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDriver = exports.updateDriver = exports.getAllDrivers = exports.addDriver = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_model_1 = require("../models/user.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const cloudinary_1 = require("../utils/cloudinary");
// create driver
exports.addDriver = (0, catchAsync_1.default)(async (req, res) => {
    const { name, email, phone, password, username } = req.body;
    // Validate required fields
    if (!name || !email || !password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Name, email, and password are required');
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide a valid email address');
    }
    // Validate password strength
    if (password.length < 6) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password must be at least 6 characters long');
    }
    // Check if user already exists
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'User with this email already exists');
    }
    // Handle image upload if present
    let avatar;
    if (req.file) {
        try {
            const cloudinaryResponse = await (0, cloudinary_1.uploadToCloudinary)(req.file.path);
            if (!cloudinaryResponse) {
                throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to upload image to Cloudinary');
            }
            avatar = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        }
        catch (error) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Error processing image upload');
        }
    }
    // Generate username if not provided
    const generatedUsername = username || email.split('@')[0];
    // Create new driver
    const newDriver = await user_model_1.User.create({
        name,
        email,
        phone: phone || undefined,
        password,
        username: generatedUsername,
        avatar,
        role: 'driver',
    });
    // Remove sensitive data before sending response
    const driverResponse = { ...newDriver.toObject() };
    delete driverResponse.password;
    delete driverResponse.password_reset_token;
    delete driverResponse.verificationInfo;
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: 'Driver created successfully',
        data: {
            driver: driverResponse,
        },
    });
});
// get all the drivers
exports.getAllDrivers = (0, catchAsync_1.default)(async (req, res) => {
    const drivers = await user_model_1.User.find({ role: 'driver' }).select('-password -password_reset_token -verificationInfo');
    if (!drivers || drivers.length === 0) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No drivers found');
    }
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Drivers fetched successfully',
        data: {
            drivers,
        },
    });
});
// update driver info
exports.updateDriver = (0, catchAsync_1.default)(async (req, res) => {
    const { id, name, email, phone, username } = req.body;
    if (!id) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Driver ID is required');
    }
    const driver = await user_model_1.User.findOne({ _id: id, role: 'driver' });
    if (!driver) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Driver not found');
    }
    // Update only basic info (not password)
    driver.name = name || driver.name;
    driver.email = email || driver.email;
    if (phone !== undefined) {
        driver.phone = phone;
    }
    driver.username = username || driver.username;
    await driver.save();
    const updatedDriver = driver.toObject();
    delete updatedDriver.password;
    delete updatedDriver.password_reset_token;
    delete updatedDriver.verificationInfo;
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Driver updated successfully',
        data: {
            driver: updatedDriver,
        },
    });
});
// delete driver
exports.deleteDriver = (0, catchAsync_1.default)(async (req, res) => {
    const driverId = req.params.id;
    const driver = await user_model_1.User.findOneAndDelete({ _id: driverId, role: 'driver' });
    if (!driver) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Driver not found or already deleted');
    }
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Driver deleted successfully',
    });
});
