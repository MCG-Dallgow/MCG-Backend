import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app: Express = express()
const port = 3000

// MIDDLEWARE
app.use(helmet())

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// ROUTER
import authRouter from './routes/auth'
import timetableRouter from './routes/timetable'
import teachersRouter from './routes/teachers'

app.use('/auth/', authRouter)
app.use('/timetable/', timetableRouter)
app.use('/teachers/', teachersRouter)

// RUN
app.listen(port, () => {
    console.log(`MCG-App backend listening on port ${port}`)
})