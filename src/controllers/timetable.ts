import { RequestHandler } from 'express';

import * as timetable from '../services/timetable.service';
import { checkSessionToken } from '../services/session.service';

// fetch, reformat and return timetable data from WebUntis
export const getTimetable: RequestHandler = async (req, res) => {
    const sessionToken: string = req.body.session_token;
    const startDate = !req.body.start_date ? new Date() : new Date(req.body.start_date);
    const endDate = !req.body.end_date ? new Date() : new Date(req.body.end_date);

    const user = await checkSessionToken(sessionToken);
    if (!user) {
        res.status(401).json({ success: false, message: 'invalid credentials' });
        return;
    }

    const timetableData = await timetable.getTimetable(user, startDate, endDate);

    res.json({ success: true, data: timetableData });
}
