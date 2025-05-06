"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
// export const getUsers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     res.json({ message: 'Get all users' })
//   } catch (err) {
//     next(err)
//   }  
// }
exports.getUsers = (0, catchAsync_1.default)(async (req, res) => {
    // console.log("dasfdsf")
    const user = null;
    if (!user) {
        throw new AppError_1.default(400, "user not found");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Get all users',
        data: [],
    });
});
