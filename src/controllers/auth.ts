import { WebUntis, Klasse, Student } from 'webuntis';
import { RequestHandler, Request, Response } from 'express';
import { MysqlError } from 'mysql';

import connection from '../services/db'; // DATABASE

async function getStudentClass(untis: WebUntis): Promise<Klasse> {
    const classId: number = untis.sessionInformation!.klasseId!;
    const classes: Klasse[] = await untis.getClasses(false, 2023);
    return classes.filter((class_) => class_.id == classId)[0];
}

// check WebUntis credentials and return API session
export async function authenticate(req: Request, res: Response): Promise<WebUntis | undefined> {
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
export const login: RequestHandler = async (req, res, next) => {
    // authenticate and start WebUntis API session
    const untis: WebUntis | undefined = await authenticate(req, res);
    if (!untis) return; // abort if authentication was unsuccessful

    // get user data from WebUntis
    const students: Student[] = await untis.getStudents();
    const student: Student = students.filter((student) => student.id == untis.sessionInformation!.personId)[0];
    const studentClass = await getStudentClass(untis);
    const user = {
        username: student.name,
        firstname: student.foreName,
        lastname: student.longName,
        class: studentClass.name,
    };

    // exit WebUntis API session
    await untis.logout();

    // add user to database if not already present
    connection.query(
        `SELECT * FROM user WHERE username = "${user.username}"`,
        async (err: MysqlError, data: Array<Object>) => {
            if (err) next(err); // handle database error

            if (data.length == 0) {
                // create new user in database
                connection.query(
                    `INSERT INTO user(username, firstname, lastname, class) 
                    VALUES ("${user.username}", "${user.firstname}", "${user.lastname}", "${user.class}")`
                );
            }
        }
    );

    // return user data
    res.json({ data: user });
};
