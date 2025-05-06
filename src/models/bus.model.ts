import mongoose, { Schema, Document } from 'mongoose'
import { IBus } from '../interface/bus.interface'


const busSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    bus_number: { type: String, required: true },
    seat: { type: String, required: true },
    standing: { type: Number, required: true },
  },
  { timestamps: true }
)

export const Bus = mongoose.model<IBus>('Bus', busSchema)
