import { WebUntis, Klasse } from 'webuntis';
import { RequestHandler, Request, Response } from 'express';
import { eq } from 'drizzle-orm';

import db from '../db/db';
import { User, users } from '../db/schema'

export async function getStudentGroup(untis: WebUntis): Promise<Klasse> {
    const groupId = untis.sessionInformation!.klasseId!;
    const schoolYearId = (await untis.getLatestSchoolyear()).id;
    const groups = await untis.getClasses(undefined, schoolYearId);
    const group = groups.filter((group) => group.id == groupId)[0];
    return group
}

// check WebUntis credentials and return API session
export async function authenticate(req: Request, res: Response) {
    // get credentials from authorization header
    const base64String: string = req.headers.authorization?.split(' ')[1]!;
    const credentials: string = Buffer.from(base64String, 'base64').toString();
    const username: string = credentials.split(':')[0];
    const password: string = credentials.split(':')[1];

    // check WebUntis credentials and start API session
    const untis: WebUntis = new WebUntis(
        'Marie-Curie-Gym',
        username,
        password,
        'herakles.webuntis.com'
    );
    try {
        await untis.login();
    } catch (err) {
        res.status(401).json({ message: 'invalid credentials' });
        return undefined;
    }

    // return API session
    return untis;
}

// login user + add to database if not already present
export const login: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const untis = await authenticate(req, res);
    if (!untis) return; // abort if authentication was unsuccessful

    // get user data from WebUntis
    const students = await untis.getStudents();
    const student = students.filter(
        (student) => student.id == untis.sessionInformation!.personId
    )[0];
    const group = await getStudentGroup(untis);
    const groupName = group.name.replace('Jhg', '')
    const grade = parseInt(groupName.match(/[0-9]{2}/)![0])

    // exit WebUntis API session
    await untis.logout();

    // check if user is in database
    var user: User = (await db.select().from(users).where(eq(users.id, student.name)))[0]

    // add user to database if not already present
    if (!user) {
        await db.insert(users).values({
            id: student.name,
            firstname: student.foreName,
            lastname: student.longName,
            type: 'student',
            grade: grade,
            group: groupName,
        })

        user = (await db.select().from(users).where(eq(users.id, student.name)))[0]
    }

    // return user data
    res.json({ data: user });
};
