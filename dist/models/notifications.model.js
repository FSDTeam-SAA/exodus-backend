"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['success', 'error', 'warning'], default: 'success' },
    read: { type: Boolean, default: false },
}, {
    timestamps: true,
});
exports.Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
