"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const getUsers = async (req, res, next) => {
    try {
        res.json({ message: 'Get all users' });
    }
    catch (err) {
        next(err);
    }
};
exports.getUsers = getUsers;
