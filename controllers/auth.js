const { WebUntis } = require('webuntis');

// DATABASE
const connection = require('../services/db')

async function getStudentClass(untis) {
    const classId = untis.sessionInformation.klasseId
    const classes = await untis.getClasses()
    return classes.filter((class_) => class_.id == classId)[0]
}

// login user + add to database if not already present
exports.login = async (req, res, next) => {
    // get credentials from request body
    const username = req.body['username']
    const password = req.body['password']

    // check WebUntis credentials and create API session
    const untis = new WebUntis('Marie-Curie-Gym', username, password, 'herakles.webuntis.com')
    try {
        await untis.login() 
    } catch(err) {
        res.status(400).json({message: 'invalid credentials'})
        return;
    }

    // get user data from WebUntis
    const students = await untis.getStudents()
    const student = students.filter(student => student.name == username)[0]
    const studentClass = await getStudentClass(untis)
    const user = {
        username: username,
        firstname: student.foreName,
        lastname: student.longName,
        class: studentClass.name
    }

    // exit WebUntis API session
    await untis.logout()

    // add user to database if not already present
    connection.query(`SELECT * FROM user WHERE username = "${username}"`, async (err, data, fields) => {
        if (err) next(err) // handle database error

        if(data.length == 0) {
            // create new user in database
            connection.query(
                `INSERT INTO user(username, firstname, lastname, class) 
                 VALUES ("${user.username}", "${user.firstname}", "${user.lastname}", "${user.class}")`
            )
        }
    })

    // return user data
    res.json({
        data: user
    })
}