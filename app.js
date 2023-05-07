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

app.use('/auth/', authRouter)

// RUN
app.listen(port, () => {
    console.log(`MCG-App backend listening on port ${port}`)
})