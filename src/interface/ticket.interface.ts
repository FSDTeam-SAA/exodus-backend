import { Types } from 'mongoose'

export interface ITicket {
  schedule: Types.ObjectId
  userId: Types.ObjectId
  price: number
  busNumber: Types.ObjectId
  seatNumber: String,
  source: string,
  destination: string,
  date: Date,
  time: string
  qrCode: string
  validFor: Date,
  avaiableSeat: [string],
  status: "pending" | "rejected" | "accpeted" | "booked",
  ride: "pending" | "cancelled" | "completed" | "running",
  key: string
  paymentStatus: "paid" | "unpaid" | "return",
}
