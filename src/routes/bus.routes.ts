import express from 'express'
import { createBus,updateBus,getAllBuses,getBusById, deleteBus} from '../controllers/bus.controller'
import { isAdmin, protect } from '../middlewares/auth.middleware'

const router = express.Router()

router.post('/',protect,isAdmin, createBus )
router.patch('/:id',protect,isAdmin, updateBus ),
router.get('/all-bus',protect,isAdmin, getAllBuses ),
router.get('/:id',protect,isAdmin, getBusById ),
router.delete( '/:id',protect, isAdmin, deleteBus )


export default router
