import mongoose, { Schema, model } from 'mongoose'
import { ITicket } from '../interface/ticket.interface'

const ticketSchema = new Schema<ITicket>({
  schedule: { type: Schema.Types.ObjectId, ref: 'Schedule' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true },
  busNumber: { type: Schema.Types.ObjectId, required: true },
  seatNumber: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: Date, required: true },
  qrCode: { type: String, required: true },
  validFor: { type: Date},
  avaiableSeat: {type: [String]},
  status: { type: String, default: 'pending' },
  ride: { type: String, default: 'pending' },
  key: { type: String, required: true },

})

export const Ticket = model<ITicket>('Ticket', ticketSchema)
