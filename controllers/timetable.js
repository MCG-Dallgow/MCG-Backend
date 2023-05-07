const auth = require('./auth')

// fetch, reformat and return timetable data from WebUntis
exports.getTimetable = async (req, res, next) => {
    // authenticate and start WebUntis API session
    untis = await auth.authenticate(req, res)
    if (!untis) return; // abort if authentication was unsuccessful

    // get date range from request body
    const startDate = new Date(req.body['startdate'])
    const endDate = new Date(req.body['enddate'])

    // fetch timetable data from WebUntis API
    const timetable = await untis.getOwnTimetableForRange(startDate, endDate)

    // exit WebUntis API session
    untis.logout()

    // format timetable data
    const formattedTimetable = formatTimetable(timetable)

    // return timetable data
    res.json({data: formattedTimetable})
}

// format timetable data for increased readability and efficiency
function formatTimetable(timetable) {
    // sort timetable by date
    timetable.sort((a, b) => {
        if (a.date < b.date) return -1
        if (a.date > b.date) return 1
        if (a.startTime < b.startTime) return -1
        if (a.startTime > b.startTime) return 1
    })

    const formattedTimetable = []
    // iterate over timetable entries
    for (var i = 0; i < timetable.length - 1; i++) {
        const current = timetable[i]
        const next = timetable[i + 1]

        // join double lessons into one object
        if (current.lsnumber === next.lsnumber) {
            // reformat date
            const dateString = current.date.toString()
            const date = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6, 8)}`

            // reformat start and end times
            const startTime = String(current.startTime)
                    .padStart(4, '0')
                    .match(/.{1,2}/g)
                    .join(':')
            const endTime = String(next.endTime)
                    .padStart(4, '0')
                    .match(/.{1,2}/g)
                    .join(':')

            // reformat teacher data
            var teachers = []
            var originalTeachers = []
            for (const index in current.te) {
                const teacher = current.te[index]
                if (teacher.name) teachers.push(teacher.name)
                if (teacher.orgname) originalTeachers.push(teacher.orgname)
            }
            teachers = [...new Set(teachers)] // remove duplicate teachers
            originalTeachers = [...new Set(originalTeachers)]
            
            // reformat room data
            var rooms = []
            var originalRooms = []
            for (const index in current.ro) {
                const room = current.ro[index]
                if (room.name) rooms.push(room.name)
                if (room.orgname) originalRooms.push(room.orgname)
            }
            rooms = [...new Set(rooms)] // remove duplicate rooms
            originalRooms = [...new Set(originalRooms)]

            // append formatted lesson to new timetable object
            formattedTimetable.push({
                date: date,
                startTime: startTime,
                endTime: endTime,
                code: current.code,
                substitutionText: current.substText,
                teachers: teachers,
                originalTeachers: originalTeachers,
                course: current.su.name,
                rooms: rooms,
                originalRooms: originalRooms
            })
        }
    }
    return formattedTimetable
}