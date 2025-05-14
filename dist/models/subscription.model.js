"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    planName: { type: String, required: true },
    roundtrip: { type: Number, required: true },
    price: { type: Number, required: true },
    planValid: { type: Boolean, default: true },
});
exports.Subscription = (0, mongoose_1.model)('Subscription', subscriptionSchema);
