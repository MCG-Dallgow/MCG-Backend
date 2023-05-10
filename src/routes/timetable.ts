import express from 'express'
let router = express.Router()

import * as timetable from '../controllers/timetable'

// GET TIMETABLE
router.get('/', timetable.getTimetable)

export default router