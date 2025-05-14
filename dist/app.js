"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const bus_routes_1 = __importDefault(require("./routes/bus.routes"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const notFound_1 = require("./middlewares/notFound");
const driver_routes_1 = __importDefault(require("./routes/driver.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const ticket_routes_1 = __importDefault(require("./routes/ticket.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const reserveBus_routes_1 = __importDefault(require("./routes/reserveBus.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {});
exports.io = io;
/**---------------------- USER ALL ROUTE -------------------------- */
app.use('/api/v1/users', user_routes_1.default);
/**---------------------- AUTH ALL ROUTE -------------------------- */
app.use('/api/v1/auth', auth_routes_1.default);
/**---------------------- BUS ALL ROUTE -------------------------- */
app.use('/api/v1/bus', bus_routes_1.default);
/**---------------------- driver ALL ROUTE -------------------------- */
app.use('/api/v1', driver_routes_1.default);
/**---------------------- schedule -------------------------- */
app.use('/api/v1', schedule_routes_1.default);
/**---------------------- Ticket ALL ROUTE -------------------------- */
app.use('/api/v1/ticket', ticket_routes_1.default);
/**---------------------- Subscription Route -------------------------- */
app.use('/api/v1', subscription_routes_1.default);
/**---------------------- Bus reserve Route -------------------------- */
app.use('/api/v1', reserveBus_routes_1.default);
/**---------------------- Admin dashboard Route -------------------------- */
app.use('/api/v1', dashboard_routes_1.default);
// app.use(errorMiddleware)
app.use(globalErrorHandler_1.globalErrorHandler);
/** ------------ NOT FOUND URL ------------------- */
app.use(notFound_1.notFound);
// WebSocket connection
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    // Join user-specific room for notifications
    socket.on('joinUserRoom', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Client ${socket.id} joined user room: ${userId}`);
        }
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
