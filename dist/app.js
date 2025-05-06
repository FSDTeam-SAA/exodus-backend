"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const notFound_1 = require("./middlewares/notFound");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/users', user_routes_1.default);
app.use(error_middleware_1.default);
app.use(globalErrorHandler_1.globalErrorHandler);
/** ------------ NOT FOUND URL ------------------- */
app.use(notFound_1.notFound);
exports.default = app;
