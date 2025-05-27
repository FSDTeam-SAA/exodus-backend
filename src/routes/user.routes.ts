import express from 'express'
import { allBusRoute, allRide, getSingleUser, updateProfile } from '../controllers/user.controller'
import { protect } from '../middlewares/auth.middleware'
import { getAllNotification, markAllAsRead } from '../controllers/notification.controller'

const router = express.Router()

router.patch('/update-profile',protect, updateProfile)
router.get('/ride-history',protect, allRide)
router.get('/single-user/:id',protect, getSingleUser)
router.get("/get-notfication", protect, getAllNotification)
router.get('/mark-as-read', protect, markAllAsRead)

router.get("/get-bus-route",protect, allBusRoute)

export default router
