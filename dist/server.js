"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)().then(() => {
    app_1.server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
