import { Types } from 'mongoose'

export interface ITicket {
  routeId: Types.ObjectId
  userId: Types.ObjectId
  price: number
  busNumber: string
  seatNumber: string
  qrCode: string
  validFor: Date
}
