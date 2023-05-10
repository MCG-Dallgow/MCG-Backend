import express, { Router } from 'express';
let router: Router = express.Router();

import * as auth from '../controllers/auth';

// LOGIN
router.post('/login', auth.login);

export default router;
