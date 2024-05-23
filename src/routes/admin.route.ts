import express, { Router } from 'express';
let router: Router = express.Router();

import * as admin from '../controllers/admin';

// LOAD STUDENTS
router.post('/loadstudents', admin.loadStudents);

export default router;
