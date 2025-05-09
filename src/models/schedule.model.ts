import mongoose, { Schema, Document } from 'mongoose'
import { ISchedule } from '../interface/schedule.interface'

const busSchema: Schema = new Schema<ISchedule>(
  {
    schedules: [
      {
        day: String,
        arrivalTime: String,
        departureTime: String,
      },
    ],
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },
  },
  { timestamps: true }
)

export const Bus = mongoose.model<ISchedule>('Bus', busSchema)
