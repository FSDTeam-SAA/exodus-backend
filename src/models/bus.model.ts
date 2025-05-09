import mongoose, { Schema, Document } from 'mongoose'
import { generateDefaultSeats, IBus } from '../interface/bus.interface'


const busSchema: Schema = new Schema<IBus>(
  {
    name: { type: String, required: true },
    bus_number: { type: String, required: true },
    seat: { type: String, required: true },
    standing: { type: Number, required: true },
    source: { type: String, required: true },
    stops: [{
      name: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number},
      price: { type: Number},

    }],
    lastStop: { type: String },
    price: { type: Number, required: true },
    // totalSeat: {
    //   type: [String],
    //   default: generateDefaultSeats,
    // },
    // avaiableSeat: {
    //   type: [String],
    //   default: generateDefaultSeats,
    // },
  },
  { timestamps: true }
)

export const Bus = mongoose.model<IBus>('Bus', busSchema)
 