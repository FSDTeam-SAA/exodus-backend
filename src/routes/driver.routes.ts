import express from 'express'
import { upload } from '../middlewares/multer.middleware'
import { addDriver, getAllDrivers } from '../controllers/driver.controller'
const router = express.Router()

router.post('/add/driver',upload.single("avatar"),  addDriver)
router.get('/all/drivers', getAllDrivers)

export default router
