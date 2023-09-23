import { RequestHandler } from 'express';
import { eq, sql } from 'drizzle-orm';

import * as auth from './auth';
import db from '../db/db';
import { Staff, staff, Subject, subjects, staffToSubjects } from '../db/schema';

// fetch, reformat and return staff data from WebUntis
export const getStaff: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const [untis, _] = await auth.authenticate(req, res, true);
    if (untis) {
        // fetch and reformat WebUntis teacher data
        const teachers = formatTeachers(await untis.getTeachers());

        // update new teachers in database
        await db.insert(staff).values(teachers).onDuplicateKeyUpdate({ set: { id: sql`id` } });

        // exit WebUntis API session
        await untis.logout();
    }

    // get all staff members from database
    const staffData = await db.select()
        .from(staffToSubjects)
        .rightJoin(staff, eq(staffToSubjects.staffId, staff.id))
        .leftJoin(subjects, eq(staffToSubjects.subjectId, subjects.id));

    // reformat staff member data
    let staffMembers: (Staff & {
        subjects: Subject[],
    })[] = [];
    let lastPersonId = "";
    for (const entry of staffData) {
        if (entry.staff.id != lastPersonId) {
            staffMembers.push({
                id: entry.staff.id,
                firstname: entry.staff.id,
                lastname: entry.staff.id,
                gender: entry.staff.gender,
                email: entry.staff.email,
                subjects: [],
            });
            lastPersonId = entry.staff.id;
        }

        if (staffMembers.length > 0 && entry.subject != null) {
            staffMembers.at(-1)!.subjects.push(entry.subject);
        }
    }

    // return staff data
    return res.status(200).json({ data: staffMembers });
};

// reformat WebUntis teacher data
function formatTeachers(teachers: any): Staff[] {
    const formattedTeachers = [];

    for (const teacher of teachers) {
        // filter out irrelevant data
        if (teacher.name.startsWith('NN') || !teacher.active) continue;

        // reformat data
        formattedTeachers.push({
            id: teacher.name,
            firstname: teacher.foreName,
            lastname: teacher.longName,
            email: generateTeacherEmail(teacher.foreName, teacher.longName),
            gender: null,
        });
    }

    return formattedTeachers;
}

// generate teacher email address from first and last name
function generateTeacherEmail(firstname: string, lastname: string) {
    firstname = replaceDiacritics(firstname.toLowerCase());
    lastname = replaceDiacritics(lastname.toLowerCase());
    return `${firstname}.${lastname}@lk.brandenburg.de`;
}

// replace diacritics like umlauts
function replaceDiacritics(input: string) {
    return input
        .replaceAll(' ', '-')
        .replaceAll('ä', 'ae')
        .replaceAll('Ä', 'Ae')
        .replaceAll('ö', 'oe')
        .replaceAll('Ö', 'Oe')
        .replaceAll('ü', 'ue')
        .replaceAll('Ü', 'Ue')
        .replaceAll('ß', 'ss');
}
