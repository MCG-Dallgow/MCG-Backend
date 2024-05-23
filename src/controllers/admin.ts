import { RequestHandler } from "express";
import db from "../db/db";
import { users } from "../db/schema";
import { startWebUntisSession, getStudents } from "./webuntis";

export const loadStudents: RequestHandler = async (req, res) => {
    const username = process.env.WEBUNTIS_USERNAME ?? '';
    const key = process.env.WEBUNTIS_KEY ?? '';

    if (username == '' || key == '') {
        res.status(401).json({ success: false });
        return;
    }

    const untisSession = await startWebUntisSession(username, key);
    if (!untisSession) {
        res.status(401).json({ success: false });
        return;
    }

    const userData = await getStudents(untisSession);

    // end WebUntis session
    await untisSession.logout();

    await db.insert(users).values(userData);

    res.json({ success: true });
}

