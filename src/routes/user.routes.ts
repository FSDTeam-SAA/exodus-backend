import express from 'express'
import { allRide, updateProfile } from '../controllers/user.controller'
import { protect } from '../middlewares/auth.middleware'
import { getAllNotification, markAllAsRead } from '../controllers/notification.controller'

const router = express.Router()

router.patch('/update-profile',protect, updateProfile)
router.get('/ride-history',protect, allRide)
router.get("/get-notfication", protect, getAllNotification)
router.get('/mark-as-read', protect, markAllAsRead)

export default router
