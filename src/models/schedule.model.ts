import mongoose, { Schema, Document } from 'mongoose'
import { ISchedule } from '../interface/schedule.interface'

const busSchema: Schema = new Schema<ISchedule>(
  {
    schedules: [
      {
        day: String,
        arrivalTime: Date,
        departureTime: Date,
      },
    ],
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver' },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },
  },
  { timestamps: true }
)

export const Schedule = mongoose.model<ISchedule>('Schedule', busSchema)
