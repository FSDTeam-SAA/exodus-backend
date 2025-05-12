import express from 'express'
import { getBookingStats } from '../controllers/dashboard.controller'

const router = express.Router()

router.get('/booking-stats', getBookingStats)

export default router
 
