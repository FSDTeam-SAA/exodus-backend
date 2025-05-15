import express from 'express'
import { upload } from '../middlewares/multer.middleware'
import {
  addDriver,
  getAllDrivers,
  updateDriver,
  deleteDriver,
  driverScheduledTrips,
} from '../controllers/driver.controller'
import { isDriver, protect } from '../middlewares/auth.middleware'
const router = express.Router()

router.post('/add/driver',upload.single("avatar"),  addDriver)
router.get('/all/drivers', getAllDrivers)
router.put('/drivers', updateDriver)
router.delete('/drivers/:id', deleteDriver)
router.get('/drivers/schedule',protect,isDriver, driverScheduledTrips)

export default router
