import mongoose, { Schema, model } from 'mongoose'
import { ISubscription } from '../interface/subscription.interface'

const subscriptionSchema = new Schema<ISubscription>({
  planName: { type: String, required: true },
  totalRide: { type: Number, required: true },
  credit: { type: Number, required: true },
  price: { type: Number, required: true },
  planValid: { type: Boolean, required: true },
})

export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema
)
