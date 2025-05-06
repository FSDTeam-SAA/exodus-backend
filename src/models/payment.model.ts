import mongoose, { Schema, model, Types } from 'mongoose'
import { IPayment } from '../interface/Payment.interface'

const paymentSchema = new Schema<IPayment>({
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
})

export const Payment = model<IPayment>('Payment', paymentSchema)
