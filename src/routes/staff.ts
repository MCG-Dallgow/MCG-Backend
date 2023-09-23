import express from 'express';
let router = express.Router();

import * as staff from '../controllers/staff';

// STAFF LIST
router.get('/', staff.getStaff);

export default router;
