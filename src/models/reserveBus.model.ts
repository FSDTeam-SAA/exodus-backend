import mongoose, { Schema, model } from 'mongoose'
import { IReserveBus } from '../interface/reserveBus.interface'

const reserveBusSchema = new Schema<IReserveBus>(
  {
    bus_number: { type: String },
    time: { type: String, required: true },
    day: { type: Date, required: true },
    price: { type: Number, required: true },
    totalHour: { type: Number, required: true },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reserved', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

export const ReserveBus = model<IReserveBus>('ReserveBus', reserveBusSchema)
