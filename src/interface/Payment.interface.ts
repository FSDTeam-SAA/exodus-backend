import { Types } from "mongoose"

export interface IPayment {
  planId: Types.ObjectId
  userId: Types.ObjectId
}