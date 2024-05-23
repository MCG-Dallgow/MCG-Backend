import express from 'express';
let router = express.Router();

import * as courses from '../controllers/courses';

// GET COURSES
router.get('/', courses.getCourses);

export default router;
