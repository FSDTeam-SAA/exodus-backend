import { ObjectId } from "mongoose";

export interface IRoute extends Document {
    bus_id: ObjectId,
    source: string,
    destination: [{
      name: string,
      latitude: number,
      longitude: number
      price: number
    }],
    departure_time: Date,
    arrival_time: Date,
    driver_id: ObjectId,
    price: number,
    scheduled: Date,
    totalSeat: string[],
    avaiableSeat: string[]
  }