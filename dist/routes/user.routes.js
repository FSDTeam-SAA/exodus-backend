"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = express_1.default.Router();
router.patch('/update-profile', auth_middleware_1.protect, user_controller_1.updateProfile);
router.get('/ride-history', auth_middleware_1.protect, user_controller_1.allRide);
router.get("/get-notfication", auth_middleware_1.protect, notification_controller_1.getAllNotification);
router.get('/mark-as-read', auth_middleware_1.protect, notification_controller_1.markAllAsRead);
exports.default = router;
