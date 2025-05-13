import express from 'express'
import {
    createTicket,
    accpeteOrRejectStanding, 
    getAllTicket,
    getTicket,
    scanTicket,
    cancelTicket
} from '../controllers/ticket.controller'
import { isAdmin, isDriver, protect } from '../middlewares/auth.middleware'
const router = express.Router()

router.post('/create-ticket',protect,  createTicket)
router.post('/all-ticket',protect,isDriver,  getAllTicket)
router.patch('/accept-standing/:id',protect,isDriver, accpeteOrRejectStanding)
router.get("/admin-all-ticket",protect,isAdmin, getTicket)
router.patch("/scan-qr/:id",protect,scanTicket)
router.patch("/cancle-ticket/:id",protect,cancelTicket)

export default router
