import mongoose, { Schema, model } from 'mongoose'
import { ISubscription } from '../interface/subscription.interface'

const subscriptionSchema = new Schema<ISubscription>({
  planName: { type: String, required: true },
  roundtrip: { type: Number, required: true },
  price: { type: Number, required: true },
  planValid: { type: Boolean, default: true  },
})

export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema
)
