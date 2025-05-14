"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_middleware_1 = require("../middlewares/multer.middleware");
const driver_controller_1 = require("../controllers/driver.controller");
const router = express_1.default.Router();
router.post('/add/driver', multer_middleware_1.upload.single("avatar"), driver_controller_1.addDriver);
router.get('/all/drivers', driver_controller_1.getAllDrivers);
router.put('/drivers', driver_controller_1.updateDriver);
router.delete('/drivers/:id', driver_controller_1.deleteDriver);
exports.default = router;
