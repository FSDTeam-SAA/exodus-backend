import { Types } from 'mongoose'

interface ScheduleItem {
  day: string
  arrivalTime: string
  departureTime: string
}

export interface ISchedule {
  schedules: ScheduleItem[]
  driverId: Types.ObjectId
  busId: Types.ObjectId
  isActive: boolean
}
