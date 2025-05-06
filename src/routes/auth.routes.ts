import express from 'express'
import { login,register,verifyEmail,forgetPassword, changePassword } from '../controllers/auth.controller'
import { protect } from '../middlewares/auth.middleware'

const router = express.Router()

router.post('/register', register),
router.post('/login', login),
router.post('/verify', verifyEmail),
router.post('/forget', forgetPassword),
router.post('/change-password', protect, changePassword)


export default router
