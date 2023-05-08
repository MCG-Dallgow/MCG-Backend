// AUTHENTICATION
const auth = require('./auth')

// DATABASE
const connection = require('../services/db')

// fetch, reformat and return teacher data from WebUntis
exports.getTeachers = async (req, res, next) => {
    // authenticate and start WebUntis API session
    untis = await auth.authenticate(req, res)
    if (!untis) return; // abort if authentication was unsuccessful
    
    // fetch and reformat WebUntis teacher data
    const teachers = formatTeachers(await untis.getTeachers())

    // exit WebUntis API session
    await untis.logout()

    // add new teachers to database if any
    updateTeachers(teachers)

    // fetch teacher data from database
    connection.query(`SELECT * FROM teacher`, async (err, data, fields) => {
        if (err) next(err) // handle database error

        // fetch subjects
        connection.query(`SELECT * FROM teacher_subject`, async (err2, data2, fields2) => {
            // add subjects to teacher data
            for (const index in data) {
                const teacher = data[index]

                const subjects = [...new Set(data2
                        .filter((relation) => relation.teacher == teacher.short)
                        .map((relation) => relation.subject))]

                teacher.subjects = subjects
            }

            // return teacher data
            res.json(data)
        })
    })
}

function formatTeachers(teachers) {
    const formattedTeachers = []

    for(const index in teachers) {
        const teacher = teachers[index]

        // filter out irrelevant data
        if (teacher.name.startsWith('NN') || !teacher.active) continue

        // reformat data
        formattedTeachers.push({
            short: teacher.name,
            firstname: teacher.foreName,
            lastname: teacher.longName,
            title: teacher.title
        })
    }

    return formattedTeachers
}

// add new teachers to database if any
async function updateTeachers(teachers) {
    // add new teachers to database
    for (const index in teachers) {
        const teacher = teachers[index]

        // check if teacher is in database
        connection.query(`SELECT * FROM teacher WHERE teacher.short="${teacher.short}"`, async (err, data, fields) => {
            if (err) next(err) // handle database error

            // add teacher to database if not already present
            if (data.length == 0) {
                connection.query(
                    `INSERT INTO teacher(short, firstname, lastname, title)
                     VALUES ("${teacher.short}", "${teacher.firstname}", "${teacher.lastname}", "${teacher.title}")`
                )
            }
        })
    }
}