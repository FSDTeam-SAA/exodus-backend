import express from 'express'
import { login,register,verifyEmail,forgetPassword, changePassword, resetPassword, refreshToken } from '../controllers/auth.controller'
import { protect } from '../middlewares/auth.middleware'

const router = express.Router()

router.post('/register', register),
router.post('/login', login),
router.post('/verify', verifyEmail),
router.post('/forget', forgetPassword),
router.post('/reset-password', resetPassword)
router.post('/change-password', protect, changePassword)
router.post('/refresh-token', refreshToken)


export default router
