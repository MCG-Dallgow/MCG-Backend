import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';

import db from '../../db/db';
import { User, sessions } from '../../db/schema';


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

export async function checkSessionToken(user: User, token: string) {
    var session = (await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.userId, user.id), eq(sessions.token, token))))[0];

    // deny if token is invalid
    if (!session) {
        return false;
    }

    // deny if token is expired
    if (new Date() > session.expiresAt) {
        invalidateSessionToken(token);  // remove expired session
        return false;
    }

    return true;
}

async function invalidateSessionToken(token: string) {
    await db.delete(sessions).where(eq(sessions.token, token));
}

