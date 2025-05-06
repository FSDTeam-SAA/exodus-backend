import express from 'express'
import { getUsers, updateProfile } from '../controllers/user.controller'
import { protect } from '../middlewares/auth.middleware'

const router = express.Router()

router.patch('/update-profile',protect, updateProfile)

export default router
