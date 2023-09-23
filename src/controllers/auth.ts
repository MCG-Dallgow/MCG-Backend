import { WebUntis, WebUntisSecretAuth } from 'webuntis';
import { authenticator as Authenticator } from 'otplib';
import { RequestHandler, Request, Response } from 'express';
import { eq } from 'drizzle-orm';

import db from '../db/db';
import { User, users } from '../db/schema'

async function getStudentGroup(untis: WebUntis): Promise<string> {
    const groupId = untis.sessionInformation!.klasseId!;
    const schoolYearId = (await untis.getLatestSchoolyear()).id;
    const groups = await untis.getClasses(undefined, schoolYearId);
    const group = groups.filter((group) => group.id == groupId)[0];
    const groupName = group.name.replace('Jhg', '')
    return groupName
}

// check WebUntis credentials and return API session
export async function authenticate(req: Request, res: Response, requireUser: boolean): Promise<[WebUntis | undefined, User | undefined]> {
    // get credentials from authorization header
    const base64String: string = req.headers.authorization?.split(' ')[1] ?? '';
    const credentials: string = Buffer.from(base64String, 'base64').toString();
    const username: string = credentials.split(':')[0] ?? '';
    const password: string = credentials.split(':')[1] ?? '';

    if (base64String == '' || username == '' || password == '') {
        return [undefined, undefined];
    }
    
    // check WebUntis credentials and start API session
    var untis: WebUntis = new WebUntisSecretAuth(
        'Marie-Curie-Gym',
        username,
        password,
        'herakles.webuntis.com',
        undefined,
        Authenticator,
    );
    try {
        await untis.login();
    } catch (err) {
        untis = new WebUntis(
            'Marie-Curie-Gym',
            username,
            password,
            'herakles.webuntis.com',
        );
        try {
            await untis.login();
        } catch(err) {
            res.status(401).json({ message: 'invalid credentials' });
            return [undefined, undefined];
        }
    }

    // check if user is in database
    var user: User = (await db.select().from(users).where(eq(users.id, username)))[0];

    if (requireUser && !user) {
        res.status(401).json({ message: 'user not logged in' });
        return [undefined, undefined];
    }

    // return API session
    return [untis, user];
}

// login user + add to database if not already present
export const login: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    var [untis, user] = await authenticate(req, res, false);
    if (!untis) return; // abort if authentication was unsuccessful

    // get user data from WebUntis
    const students = await untis.getStudents();
    const student = students.filter(
        (student) => student.id == untis!.sessionInformation!.personId
    )[0];
    const group = await getStudentGroup(untis);
    const grade = parseInt(group.match(/[0-9]{2}/)![0]);

    // exit WebUntis API session
    await untis.logout();

    // add user to database if not already present
    if (!user) {
        await db.insert(users).values({
            id: student.name,
            firstname: student.foreName,
            lastname: student.longName,
            type: 'student',
            grade: grade,
            group: group,
        })

        user = (await db.select().from(users).where(eq(users.id, student.name)))[0];
    }

    // return user data
    res.json({ data: user });
};
