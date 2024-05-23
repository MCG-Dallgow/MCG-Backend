import db from "../config/db.config";
import { users } from "../models/schema";
import * as webuntis from "./webuntis.service";

export async function loadStudents(adminUsername: string, adminKey: string) {
    const untisSession = await webuntis.startWebUntisSession(adminUsername, adminKey);
    if (!untisSession) {
        return false;
    }

    const userData = await webuntis.getStudents(untisSession);

    await untisSession.logout();

    await db.insert(users).values(userData);

    return true;
}

