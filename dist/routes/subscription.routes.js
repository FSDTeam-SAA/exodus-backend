"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("../controllers/subscription.controller");
const router = express_1.default.Router();
router.post('/subscriptions', subscription_controller_1.createSubscription);
router.patch('/subscriptions/:id', subscription_controller_1.updateSubscription);
router.get('/subscriptions', subscription_controller_1.getAllSubscriptions);
router.get('/subscriptions/:id', subscription_controller_1.getSingleSubscription);
router.delete('/subscription/:id', subscription_controller_1.deleteSubscription);
exports.default = router;
