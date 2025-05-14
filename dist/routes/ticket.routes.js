"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticket_controller_1 = require("../controllers/ticket.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post('/create-ticket', auth_middleware_1.protect, ticket_controller_1.createTicket);
router.post('/all-ticket', auth_middleware_1.protect, auth_middleware_1.isDriver, ticket_controller_1.getAllTicket);
router.patch('/accept-standing/:id', auth_middleware_1.protect, auth_middleware_1.isDriver, ticket_controller_1.accpeteOrRejectStanding);
router.get("/admin-all-ticket", auth_middleware_1.protect, auth_middleware_1.isAdmin, ticket_controller_1.getTicket);
router.patch("/scan-qr/:id", auth_middleware_1.protect, ticket_controller_1.scanTicket);
router.patch("/cancle-ticket/:id", auth_middleware_1.protect, ticket_controller_1.cancelTicket);
exports.default = router;
