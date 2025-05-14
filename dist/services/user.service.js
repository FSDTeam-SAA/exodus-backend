"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const user_model_1 = require("../models/user.model");
const cloudinary_1 = require("../utils/cloudinary");
const createUser = async (userData, avatarPath) => {
    let avatar;
    if (avatarPath) {
        const cloudinaryResponse = await (0, cloudinary_1.uploadToCloudinary)(avatarPath);
        if (cloudinaryResponse) {
            avatar = {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            };
        }
    }
    const newUser = await user_model_1.User.create({
        ...userData,
        ...(avatar && { avatar }),
    });
    return newUser;
};
exports.createUser = createUser;
