import { Document as MongooseDocument, Types } from 'mongoose'

export interface IDriver extends MongooseDocument {
  busNumber: string
  userId: Types.ObjectId
  scannerId: string
}
