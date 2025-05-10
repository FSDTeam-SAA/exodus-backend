import express from 'express'
import {
    createTicket,
    accpeteStanding, 
    getAllTicket
} from '../controllers/ticket.controller'
import { isAdmin, isDriver, protect } from '../middlewares/auth.middleware'
const router = express.Router()

router.post('/create-ticket',protect,  createTicket)
router.get('/all/ticket',protect,isDriver,  getAllTicket)
router.patch('/accept-standing/:id',protect,isDriver,   accpeteStanding)

export default router
