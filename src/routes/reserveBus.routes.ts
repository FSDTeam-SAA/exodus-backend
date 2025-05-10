import express from 'express'
import {
  createReserveBus,
  getAllReserveBuses,
  updateReservationStatus,
  cancelReservation,
  getReservationsByUserId,
} from '../controllers/reserveBus.controller'

const router = express.Router()

router.post('/', createReserveBus)
router.get('/user/:userId', getReservationsByUserId)
router.get('/', getAllReserveBuses)
router.patch('/:id/status', updateReservationStatus)
router.patch('/:id/cancel', cancelReservation)

export default router
