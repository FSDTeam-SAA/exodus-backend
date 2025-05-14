"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bus_controller_1 = require("../controllers/bus.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.protect, auth_middleware_1.isAdmin, bus_controller_1.createBus);
router.patch('/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, bus_controller_1.updateBus),
    router.get('/all-bus', auth_middleware_1.protect, auth_middleware_1.isAdmin, bus_controller_1.getAllBuses),
    router.get('/get-available-bus', auth_middleware_1.protect, auth_middleware_1.isAdmin, bus_controller_1.getAvailableBuses),
    router.get('/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, bus_controller_1.getBusById),
    router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, bus_controller_1.deleteBus);
exports.default = router;
