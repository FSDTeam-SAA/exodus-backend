import mongoose, { Schema, model } from 'mongoose'
import { IDriver } from '../interface/Driver.interface'

const driverSchema = new Schema<IDriver>(
  {
    busNumber: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    scanner_id: { type: String },
  },
  { timestamps: true }
)

export default model<IDriver>('Driver', driverSchema)
