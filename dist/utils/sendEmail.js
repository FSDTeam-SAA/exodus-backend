"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        auth: {
            user: 'snm.bdcalling@gmail.com',
            pass: 'rvkd lcjc gebc blvx',
        },
    });
    await transporter.sendMail({
        from: 'nm.bdcalling@gmail.com', // sender address
        to,
        subject: subject ? subject : 'Password change Link : change it by 10 minutes',
        html,
    });
};
exports.sendEmail = sendEmail;
