import { RequestHandler } from 'express';
import { Gender, Teacher } from '@prisma/client';

import * as auth from './auth';
import db from '../services/db';

// fetch, reformat and return teacher data from WebUntis
export const getTeachers: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const untis = await auth.authenticate(req, res);
    if (!untis) return; // abort if authentication was unsuccessful

    // fetch and reformat WebUntis teacher data
    const teachers = formatTeachers(await untis.getTeachers());

    // exit WebUntis API session
    await untis.logout();

    // add new teachers to database if any
    await updateTeachers(teachers);

    // fetch teacher data from database
    const dbTeachers = await db.teacher.findMany({
        include: {
            subjects: true,
        },
    });

    // return teacher data
    return res.status(200).json({ data: dbTeachers });
};

// reformat WebUntis teacher data
function formatTeachers(teachers: any) {
    const formattedTeachers = [];

    for (const teacher of teachers) {
        // filter out irrelevant data
        if (teacher.name.startsWith('NN') || !teacher.active) continue;

        // reformat data
        formattedTeachers.push({
            id: teacher.name,
            firstname: teacher.foreName,
            lastname: teacher.longName,
            gender: Gender.UNKNOWN,
            email: generateMCGEmail(teacher.foreName, teacher.longName),
        } as Teacher);
    }

    return formattedTeachers;
}

// add new teachers to database if any
async function updateTeachers(teachers: Teacher[]) {
    // add new teachers to database
    for (const teacher of teachers) {
        // check if teacher is already in database
        const dbTeacher = await db.teacher.findUnique({
            where: {
                id: teacher.id,
            },
        });

        // add teacher to database if not already present
        if (!dbTeacher) {
            await db.teacher.create({ data: teacher });
        }
    }
}

// generate teacher email address from first and last name
function generateMCGEmail(firstname: string, lastname: string) {
    firstname = replaceDiacritics(firstname.toLowerCase());
    lastname = replaceDiacritics(lastname.toLowerCase());
    return `${firstname}.${lastname}@lk.brandenburg.de`;
}

// replace diacritics like umlauts
function replaceDiacritics(input: string) {
    return input
        .replaceAll('ä', 'ae')
        .replaceAll('Ä', 'Ae')
        .replaceAll('ö', 'oe')
        .replaceAll('Ö', 'Oe')
        .replaceAll('ü', 'ue')
        .replaceAll('Ü', 'Ue')
        .replaceAll('ß', 'ss');
}
