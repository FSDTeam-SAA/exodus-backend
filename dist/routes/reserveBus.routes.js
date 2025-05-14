"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reserveBus_controller_1 = require("../controllers/reserveBus.controller");
const router = express_1.default.Router();
router.post('/reserve-bus', reserveBus_controller_1.createReserveBus);
router.get('/reserve-bus/user/:userId', reserveBus_controller_1.getReservationsByUserId);
router.get('/reserve-bus', reserveBus_controller_1.getAllReserveBuses);
router.patch('/reserve-bus/:id/status', reserveBus_controller_1.updateReservationStatus);
router.patch('/reserve-bus/:id/cancel', reserveBus_controller_1.cancelReservation);
exports.default = router;
