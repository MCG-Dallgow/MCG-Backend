const express = require('express')
let router = express.Router()

const auth = require('../controllers/auth')

// SIGNUP
router.post('/signup', auth.signup)

module.exports = router;