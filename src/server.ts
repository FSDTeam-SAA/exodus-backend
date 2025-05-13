import {server} from './app'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
dotenv.config()

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
})
