const express = require('express')
const helmet = require('helmet')
require('dotenv').config()

const app = express()
const port = 3000

// MIDDLEWARE
app.use(helmet())

app.use(express.json())
app.use(express.urlencoded({extended: false}))

// ROUTER
const authRouter = require('./routes/auth')
const timetableRouter = require('./routes/timetable')
const teachersRouter = require('./routes/teachers')

app.use('/auth/', authRouter)
app.use('/timetable/', timetableRouter)
app.use('/teachers/', teachersRouter)

// RUN
app.listen(port, () => {
    console.log(`MCG-App backend listening on port ${port}`)
})