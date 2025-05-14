"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
});
exports.Payment = (0, mongoose_1.model)('Payment', paymentSchema);
