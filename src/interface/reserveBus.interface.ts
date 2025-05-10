import { Types } from "mongoose"


// Interface
export interface IReserveBus {
  bus_number: string
  time: string
  day: Date
  price: number
  totalHour: number
  reservedBy: Types.ObjectId
  status: 'pending' | 'reserved' | 'cancelled'
}
