import { WebUntis, Klasse } from 'webuntis';
import { RequestHandler, Request, Response } from 'express';

import db from '../services/db';

async function getStudentClass(untis: WebUntis): Promise<Klasse> {
    const classId = untis.sessionInformation!.klasseId!;
    const schoolYearId = (await untis.getLatestSchoolyear()).id;
    const classes = await untis.getClasses(undefined, schoolYearId);
    return classes.filter((class_) => class_.id == classId)[0];
}

// check WebUntis credentials and return API session
export async function authenticate(req: Request, res: Response) {
    // get credentials from request body
    const username: string = req.body['username'];
    const password: string = req.body['password'];

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
        res.status(400).json({ message: 'invalid credentials' });
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
    const studentClass = await getStudentClass(untis);

    // exit WebUntis API session
    await untis.logout();

    // check if user is in database
    var user = await db.student.findUnique({
        where: {
            id: student.name,
        },
        include: {
            group: true,
        },
    });

    // add user to database if not already present
    if (!user) {
        user = await db.student.create({
            data: {
                id: student.name,
                firstname: student.foreName,
                lastname: student.longName,
                group: {
                    connectOrCreate: {
                        create: {
                            name: studentClass.name,
                        },
                        where: {
                            name: studentClass.name,
                        },
                    },
                },
            },
            include: {
                group: true,
            },
        });
    }

    // return user data
    res.json({ data: user });
};
