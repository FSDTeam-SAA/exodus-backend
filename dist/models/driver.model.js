"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const driverSchema = new mongoose_1.Schema({
    busNumber: { type: String
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    scannerId: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Driver', driverSchema);
