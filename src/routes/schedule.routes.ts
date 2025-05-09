import express from 'express'
import {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller'
const router = express.Router()

router.post('/add/schedule', createSchedule)
router.get('/all/schedules', getAllSchedules)
router.put('/schedules', updateSchedule)
router.delete('/schedules/:id', deleteSchedule)

export default router
