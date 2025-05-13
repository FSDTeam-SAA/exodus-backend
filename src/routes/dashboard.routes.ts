import express from 'express'
import {
  getBookingStats,
  getTotalUsers,
} from '../controllers/dashboard.controller'

const router = express.Router()

router.get('/booking-stats', getBookingStats)
router.get('/count', getTotalUsers)



export default router
 
