import { Types } from "mongoose"


// Interface
export interface IReserveBus {
  bus_number: string
  time: string
  day: string
  price: number
  reservedBy: Types.ObjectId
  status: 'pending' | 'reserved'
}
