"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = require("mongoose");
const ticketSchema = new mongoose_1.Schema({
    schedule: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Schedule' },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, required: true },
    busNumber: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    seatNumber: { type: String, required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    qrCode: { type: String },
    ticket_secret: { type: String },
    avaiableSeat: { type: [String] },
    status: { type: String, default: 'pending' },
    // ride: { type: String, default: 'pending' },
    key: { type: String, required: true },
}, {
    timestamps: true,
});
exports.Ticket = (0, mongoose_1.model)('Ticket', ticketSchema);
