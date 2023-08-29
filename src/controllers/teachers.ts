import { RequestHandler } from 'express';

import * as auth from './auth';

// fetch, reformat and return teacher data from WebUntis
export const getTeachers: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const [untis, _] = await auth.authenticate(req, res, true);
    if (!untis) return; // abort if authentication was unsuccessful

    // fetch and reformat WebUntis teacher data
    const teachers = formatTeachers(await untis.getTeachers());

    // exit WebUntis API session
    await untis.logout();

    // return teacher data
    return res.status(200).json({ data: teachers });
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
            email: generateMCGEmail(teacher.foreName, teacher.longName),
        });
    }

    return formattedTeachers;
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
