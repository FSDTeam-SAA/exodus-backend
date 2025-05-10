import express from 'express'
import { allRide, getUsers, updateProfile } from '../controllers/user.controller'
import { protect } from '../middlewares/auth.middleware'

const router = express.Router()

router.patch('/update-profile',protect, updateProfile)
router.get('/ride-history',protect, allRide)

export default router
