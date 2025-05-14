"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/register', auth_controller_1.register),
    router.post('/login', auth_controller_1.login),
    router.post('/verify', auth_controller_1.verifyEmail),
    router.post('/forget', auth_controller_1.forgetPassword),
    router.post('/reset-password', auth_controller_1.resetPassword);
router.post('/change-password', auth_middleware_1.protect, auth_controller_1.changePassword);
exports.default = router;
