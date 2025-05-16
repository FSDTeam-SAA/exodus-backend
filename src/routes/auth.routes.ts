import express from 'express'
import { login,register,verifyEmail,forgetPassword, changePassword, resetPassword, refreshToken, UserData, logout } from '../controllers/auth.controller'
import { protect } from '../middlewares/auth.middleware'

const router = express.Router()

router.post('/register', register),
router.post('/login', login),
router.get("/user-data", protect, UserData)
router.post('/verify', verifyEmail),
router.post('/forget', forgetPassword),
router.post('/reset-password', resetPassword)
router.post('/change-password', protect, changePassword)
router.post('/refresh-token', refreshToken)
router.post ('/logout',protect, logout)


export default router
