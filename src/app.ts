import express from 'express'
import userRoutes from './routes/user.routes'
import errorMiddleware from './middlewares/error.middleware'
import { globalErrorHandler } from './middlewares/globalErrorHandler'
import { notFound } from './middlewares/notFound'

const app = express()

app.use(express.json())

app.use('/api/users', userRoutes)

app.use(errorMiddleware)
app.use(globalErrorHandler);

/** ------------ NOT FOUND URL ------------------- */
app.use(notFound as never);

export default app
