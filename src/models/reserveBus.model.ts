import mongoose, { Schema, model } from 'mongoose'
import { IReserveBus } from '../interface/reserveBus.interface'

// Schema
const reserveBusSchema = new Schema<IReserveBus>({
  bus_number: { type: String, required: true },
  time: { type: String, required: true },
  day: { type: String, required: true },
  price: { type: Number, required: true },
  reservedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reserved'],
    default: 'pending',
  },
}, { timestamps: true })

// Model
export const ReserveBus = model<IReserveBus>('ReserveBus', reserveBusSchema)
