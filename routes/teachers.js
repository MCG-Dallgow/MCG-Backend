const express = require('express')
let router = express.Router()

const teachers = require('../controllers/teachers')

// TEACHER LIST
router.get('/', teachers.getTeachers)

module.exports = router