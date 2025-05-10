import express from 'express'
import {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
} from '../controllers/schedule.controller'
import { isAdmin, protect } from '../middlewares/auth.middleware'
const router = express.Router()

router.post('/add/schedule',protect,isAdmin, createSchedule)
router.get('/all/schedules',protect,isAdmin, getAllSchedules)
router.put('/schedules',protect,isAdmin, updateSchedule)
router.delete('/schedules/:id',protect,isAdmin, deleteSchedule)

export default router
