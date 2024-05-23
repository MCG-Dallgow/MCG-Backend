import crypto from 'crypto';
import { eq } from 'drizzle-orm';

import db from '../config/db.config';
import { User, sessions, users } from '../models/schema';


export async function generateSessionToken(user: User, validForDays: number = 7) {
    const token = crypto.randomBytes(64).toString('base64url');
    const expirationDate = new Date(Date.now() + validForDays * 24 * 60 * 60 * 1000);

    // write token to database
    await db.insert(sessions).values({
        token: token,
        userId: user.id,
        expiresAt: expirationDate,
    });

    return token;
}

export async function checkSessionToken(token: string) {
    var session = (await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token)))[0];

    // deny if token is invalid
    if (!session) {
        return undefined;
    }

    // deny if token is expired
    if (new Date() > session.expiresAt) {
        invalidateSessionToken(token);  // remove expired session
        return undefined;
    }

    // get user
    const user = (await db.select().from(users).where(eq(users.id, session.userId)))[0];

    return user;
}

async function invalidateSessionToken(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
}

