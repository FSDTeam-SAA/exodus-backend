import { ObjectId } from "mongoose";

export interface IRoute extends Document {
    bus_id: ObjectId,
    source: string,
    destination: string,
    departure_time: Date,
    arrival_time: Date,
    driver_id: ObjectId,
    price: number,
    TotalSeat: string[],
    avaiableSeat: string[]
  }