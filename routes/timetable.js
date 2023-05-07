const express = require('express')
let router = express.Router()

const timetable = require('../controllers/timetable')

// GET TIMETABLE
router.get('/', timetable.getTimetable)

module.exports = router