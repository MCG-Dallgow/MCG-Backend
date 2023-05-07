const express = require('express')
let router = express.Router()

const auth = require('../controllers/auth')

// LOGIN
router.post('/login', auth.login)

module.exports = router