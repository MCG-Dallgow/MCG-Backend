import { Lesson } from 'webuntis';

import { getSubjectId } from '../util/util';
import { User, students } from '../models/schema';
import { startWebUntisSession } from './webuntis.service';
import db from '../config/db.config';
import { eq } from 'drizzle-orm';

// fetch, reformat and return timetable data from WebUntis
export async function getTimetable(user: User, startDate: Date, endDate: Date) {
    // start WebUntis API session
    const untisSession = await startWebUntisSession(user.username, user.webuntisKey);
    if (!untisSession) {
        return undefined;
    }

    // fetch timetable data from WebUntis API
    const timetable = await untisSession.getOwnTimetableForRange(startDate, endDate);

    // exit WebUntis API session
    untisSession.logout();

    // get student data
    const student = (await db.select().from(students).where(eq(students.id, user.id)))[0];

    // format timetable data
    const formattedTimetable = formatTimetable(timetable, student.group);

    // return timetable data
    return formattedTimetable;
};

// format timetable data for increased readability and efficiency
function formatTimetable(timetable: Lesson[], studentGroup: string) {
    // sort timetable by date
    timetable.sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return 1;
    });

    // filter out entries not belonging to class of student
    timetable = timetable.filter(
        (lesson) => lesson.kl[0].name.includes(studentGroup)
    );

    const formattedTimetable = [];
    // iterate over timetable entries
    for (var i = 0; i < timetable.length - 1; i++) {
        const current: any = timetable[i];
        const next: any = timetable[i + 1];

        // join double lessons into one object
        if (current.lsnumber === next.lsnumber) {
            // reformat date
            const dateString = current.date.toString();
            const date = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(
                6,
                8
            )}`;

            // reformat start and end times
            const startTime = String(current.startTime)
                .padStart(4, '0')
                .match(/.{1,2}/g)!
                .join(':');
            const endTime = String(next.endTime)
                .padStart(4, '0')
                .match(/.{1,2}/g)!
                .join(':');

            // reformat teacher data
            var teachers = [];
            var originalTeachers = [];
            for (const teacher of current.te) {
                if (teacher.name) teachers.push(teacher.name);
                if (teacher.orgname) originalTeachers.push(teacher.orgname);
            }
            teachers = [...new Set(teachers)]; // remove duplicate teachers
            originalTeachers = [...new Set(originalTeachers)];

            // reformat room data
            var rooms = [];
            var originalRooms = [];
            for (const room of current.ro) {
                if (room.name) rooms.push(room.name);
                if (room.orgname) originalRooms.push(room.orgname);
            }
            rooms = [...new Set(rooms)]; // remove duplicate rooms
            originalRooms = [...new Set(originalRooms)];

            // reformat course data
            const course = {
                id: current.su[0].name,
                subject: getSubjectId(current.su[0].longname),
            };

            // append formatted lesson to new timetable object
            formattedTimetable.push({
                date: date,
                startTime: startTime,
                endTime: endTime,
                code: current.code,
                substitutionText: current.substText,
                course: course,
                teachers: teachers,
                ...(originalTeachers.length > 0 && { originalTeachers: originalTeachers }),
                rooms: rooms,
                ...(originalRooms.length > 0 && { originalRooms: originalRooms }),
            });
        }
    }

    return formattedTimetable;
}
