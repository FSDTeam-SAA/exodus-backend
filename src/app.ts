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
import cors from 'cors'

import dashboardRoutes from './routes/dashboard.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
const app = express()

app.use(express.json())
app.use(cors({ origin: '*' }))
const server = createServer(app);
const io = new Server(server, {
});


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
app.use('/api/v1', reserveBusRoutes)


/**---------------------- Admin dashboard Route -------------------------- */
app.use('/api/v1', dashboardRoutes)


// app.use(errorMiddleware)
app.use(globalErrorHandler);

/** ------------ NOT FOUND URL ------------------- */
app.use(notFound as never);


// WebSocket connection
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Join user-specific room for notifications
    socket.on('joinUserRoom', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Client ${socket.id} joined user room: ${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

export { app, server, io }
