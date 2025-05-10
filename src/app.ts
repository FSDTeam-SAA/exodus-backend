import express from 'express'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import busRoutes from './routes/bus.routes'
import errorMiddleware from './middlewares/error.middleware'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
import { notFound } from './middlewares/notFound'
import driverRoutes from './routes/driver.routes'
import scheduleRoutes from './routes/schedule.routes'
const app = express()

app.use(express.json())


/**---------------------- USER ALL ROUTE -------------------------- */
app.use('/api/v1/users', userRoutes)

/**---------------------- AUTH ALL ROUTE -------------------------- */
app.use('/api/v1/auth', authRoutes)

/**---------------------- BUS ALL ROUTE -------------------------- */
app.use('/api/v1/bus', busRoutes)


/**---------------------- driver ALL ROUTE -------------------------- */
app.use('/api/v1', driverRoutes)

/**---------------------- driver ALL ROUTE -------------------------- */
app.use('/api/v1', scheduleRoutes)

// app.use(errorMiddleware)
app.use(globalErrorHandler);

/** ------------ NOT FOUND URL ------------------- */
app.use(notFound as never);

export default app
