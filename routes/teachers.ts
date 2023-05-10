import express from 'express'
let router = express.Router()

import * as teachers from '../controllers/teachers'

// TEACHER LIST
router.get('/', teachers.getTeachers)

export default router