"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReserveBus = void 0;
const mongoose_1 = require("mongoose");
const reserveBusSchema = new mongoose_1.Schema({
    bus_number: { type: String },
    time: { type: String, required: true },
    day: { type: Date, required: true },
    price: { type: Number, required: true },
    totalHour: { type: Number, required: true },
    reservedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'reserved', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });
exports.ReserveBus = (0, mongoose_1.model)('ReserveBus', reserveBusSchema);
