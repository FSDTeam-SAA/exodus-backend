"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schedule_controller_1 = require("../controllers/schedule.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/add/schedule', auth_middleware_1.protect, auth_middleware_1.isAdmin, schedule_controller_1.createSchedule);
router.get('/all/schedules', auth_middleware_1.protect, auth_middleware_1.isAdmin, schedule_controller_1.getAllSchedules);
router.put('/schedules/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, schedule_controller_1.updateSchedule);
router.delete('/schedules/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, schedule_controller_1.deleteSchedule);
router.patch('/schedule/:id/status', schedule_controller_1.toggleScheduleStatus);
exports.default = router;
