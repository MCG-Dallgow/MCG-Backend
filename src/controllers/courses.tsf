import { RequestHandler } from 'express';

import * as auth from './auth';
import { getSubjectId } from '../util/util';

export const getCourses: RequestHandler = async (req, res) => {
    // authenticate and start WebUntis API session
    const [untis, _] = await auth.authenticate(req, res, true);
    if (!untis) return; // abort if authentication was unsuccessful

    const dateRange = 8 * 7;
    const startDate = new Date();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dateRange);

    var subjects = await untis.getSubjects();
    const timetable: any = await untis.getOwnTimetableForRange(startDate, endDate);

    // exit WebUntis API session
    await untis.logout();

    const courses = [];
    for (const lesson of timetable) {

        const course = subjects.filter((s) => s.id == lesson.su[0].id)[0];

        const teachers = [];
        for (const teacher of lesson.te) {
            if (teacher.orgname) {
                teachers.push(teacher.orgname);
            } else {
                teachers.push(teacher.name);
            }
        }

        if (courses.filter((c) => c.id == course.name).length == 0) {
            courses.push({
                id: course.name,
                subject: getSubjectId(course.longName),
                teachers: teachers,
            });
        }
    }

    res.json({ data: courses });
}

