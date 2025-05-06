import mongoose, { Schema, model } from 'mongoose'
import { ITicket } from '../interface/ticket.interface'

const ticketSchema = new Schema<ITicket>({
  routeId: { type: Schema.Types.ObjectId, ref: 'Route' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, required: true },
  busNumber: { type: String, required: true },
  seatNumber: { type: String, required: true },
  qrCode: { type: String, required: true },
  validFor: { type: Date, required: true },
})

export const Ticket = model<ITicket>('Ticket', ticketSchema)
