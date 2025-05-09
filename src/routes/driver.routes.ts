import express from 'express'
import { upload } from '../middlewares/multer.middleware'
import {
  addDriver,
  getAllDrivers,
  updateDriver,
  deleteDriver,
} from '../controllers/driver.controller'
const router = express.Router()

router.post('/add/driver',upload.single("avatar"),  addDriver)
router.get('/all/drivers', getAllDrivers)
router.put('/drivers', updateDriver)
router.delete('/drivers/:id', deleteDriver)

export default router
