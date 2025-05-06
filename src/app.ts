import express from 'express'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import busRoutes from './routes/bus.routes'
import errorMiddleware from './middlewares/error.middleware'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
import { notFound } from './middlewares/notFound'

const app = express()

app.use(express.json())

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/bus', busRoutes)


// app.use(errorMiddleware)
app.use(globalErrorHandler);

/** ------------ NOT FOUND URL ------------------- */
app.use(notFound as never);

export default app
