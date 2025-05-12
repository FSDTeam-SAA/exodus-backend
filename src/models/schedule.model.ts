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
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Schedule = mongoose.model<ISchedule>('Schedule', busSchema)
