import express from 'express'
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import busRoutes from './routes/bus.routes'
import errorMiddleware from './middlewares/error.middleware'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
import { notFound } from './middlewares/notFound'
import driverRoutes from './routes/driver.routes'
import scheduleRoutes from './routes/schedule.routes'
import ticketRoutes from './routes/ticket.routes'
import subscriptionRoutes from './routes/subscription.routes'
import reserveBusRoutes from './routes/reserveBus.routes'
import { generateUniqueString } from './utils/generateOTP'
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

/**---------------------- schedule -------------------------- */
app.use('/api/v1', scheduleRoutes)


/**---------------------- Ticket ALL ROUTE -------------------------- */
app.use('/api/v1/ticket', ticketRoutes)

/**---------------------- Subscription Route -------------------------- */
app.use('/api/v1', subscriptionRoutes)

/**---------------------- Bus reserve Route -------------------------- */
app.use('/api/v1', reserveBusRoutes )

// console.log(generateUniqueString())

// app.use(errorMiddleware)
app.use(globalErrorHandler);

/** ------------ NOT FOUND URL ------------------- */
app.use(notFound as never);

export default app
