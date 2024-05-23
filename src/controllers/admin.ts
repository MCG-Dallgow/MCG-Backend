import { RequestHandler } from 'express';

import * as admin from '../services/admin.service';

export const loadStudents: RequestHandler = async (req, res) => {
    const adminUsername = process.env.WEBUNTIS_USERNAME ?? '';
    const adminKey = process.env.WEBUNTIS_KEY ?? '';

    const success = await admin.loadStudents(adminUsername, adminKey);

    res.json({ success: success });
}
