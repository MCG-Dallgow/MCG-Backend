import { RequestHandler } from 'express';
import { Teacher, WebUntis } from 'webuntis';
import { MysqlError } from 'mysql';

import * as auth from './auth'; // AUTHENTICATION
import connection from '../services/db'; // DATABASE

// fetch, reformat and return teacher data from WebUntis
export const getTeachers: RequestHandler = async (req, res, next) => {
    // authenticate and start WebUntis API session
    const untis: WebUntis | undefined = await auth.authenticate(req, res);
    if (!untis) return; // abort if authentication was unsuccessful

    // fetch and reformat WebUntis teacher data
    const teachers: Object[] = formatTeachers(await untis.getTeachers());

    // exit WebUntis API session
    await untis.logout();

    // add new teachers to database if any
    await updateTeachers(teachers, next);

    // fetch teacher data from database
    connection.query(`SELECT * FROM teacher`, async (err: any, data: any, fields: any) => {
        if (err) next(err); // handle database error

        // fetch subjects
        connection.query(
            `SELECT * FROM teacher_subject`,
            async (err2: any, data2: any, fields2: any) => {
                // add subjects to teacher data
                for (const index in data) {
                    const teacher: any = data[index];

                    const subjects = [
                        ...new Set(
                            data2
                                .filter((relation: any) => relation.teacher == teacher.short)
                                .map((relation: any) => relation.subject)
                        ),
                    ];

                    teacher.subjects = subjects;
                }

                // return teacher data
                res.json(data);
            }
        );
    });
};

function formatTeachers(teachers: Teacher[]): Object[] {
    const formattedTeachers = [];

    for (const index in teachers) {
        const teacher: any = teachers[index];

        // filter out irrelevant data
        if (teacher.name.startsWith('NN') || !teacher.active) continue;

        // reformat data
        formattedTeachers.push({
            short: teacher.name,
            firstname: teacher.foreName,
            lastname: teacher.longName,
        });
    }

    return formattedTeachers;
}

// add new teachers to database if any
async function updateTeachers(teachers: Array<Object>, next: Function) {
    // add new teachers to database
    for (const index in teachers) {
        const teacher: any = teachers[index];

        // check if teacher is in database
        connection.query(
            `SELECT * FROM teacher WHERE teacher.short="${teacher.short}"`,
            async (err: MysqlError, data: Array<Object>) => {
                if (err) next(err); // handle database error

                // add teacher to database if not already present
                if (data.length == 0) {
                    connection.query(
                        `INSERT INTO teacher(short, firstname, lastname, title)
                        VALUES ("${teacher.short}", "${teacher.firstname}", "${teacher.lastname}", "${teacher.title}")`
                    );
                }
            }
        );
    }
}
