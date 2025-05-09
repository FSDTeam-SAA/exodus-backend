import mongoose, { Schema, Document } from 'mongoose'
import { IRoute } from '../interface/route.interface';


const routeSchema: Schema<IRoute> = new Schema<IRoute>({
    bus_id: { type: Schema.Types.ObjectId, ref: 'bus', required: true },
    source: { type: String, required: true },
    destination: [{
      name: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number},
      price: { type: Number},

    }],
    departure_time: { type: Date, required: true },
    arrival_time: { type: Date, required: true },
    driver_id: { type: Schema.Types.ObjectId, ref: 'driver', required: true },
    price: { type: Number, required: true },
    scheduled: { type: Date},
    totalSeat: { type: [String], required: true },
    avaiableSeat: { type: [String], required: true },
  });
  
  export const Route = mongoose.model<IRoute>('Route', routeSchema);
