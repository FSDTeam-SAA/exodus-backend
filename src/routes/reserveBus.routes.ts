import express from 'express'
import {
  createReserveBus,
  getAllReserveBuses,
  updateReservationStatus,
  cancelReservation,
  getReservationsByUserId,
} from '../controllers/reserveBus.controller'

const router = express.Router()

router.post('/reserve-bus', createReserveBus)
router.get('/reserve-bus/user/:userId', getReservationsByUserId)
router.get('/reserve-bus', getAllReserveBuses)
router.patch('/reserve-bus/:id/status', updateReservationStatus)
router.patch('/reserve-bus/:id/cancel', cancelReservation)

export default router
