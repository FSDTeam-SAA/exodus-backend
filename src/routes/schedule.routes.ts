import express from 'express'
import {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus,
} from '../controllers/schedule.controller'
import { isAdmin, protect } from '../middlewares/auth.middleware'
const router = express.Router()

router.post('/add/schedule',protect,isAdmin, createSchedule)
router.get('/all/schedules',protect,isAdmin, getAllSchedules)
router.put('/schedules/:id',protect,isAdmin, updateSchedule)
router.delete('/schedules/:id',protect,isAdmin, deleteSchedule)
router.patch('/schedule/:id/status', toggleScheduleStatus)

export default router
