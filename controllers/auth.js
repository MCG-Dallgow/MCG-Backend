const { WebUntis } = require('webuntis')

// DATABASE
const connection = require('../services/db')

async function getStudentClass(untis) {
    const classId = untis.sessionInformation.klasseId
    const classes = await untis.getClasses()
    return classes.filter((class_) => class_.id == classId)[0]
}

// check WebUntis credentials and return API session
exports.authenticate = async (req, res) => {
    // get credentials from request body
    const username = req.body['username']
    const password = req.body['password']

    // check WebUntis credentials and start API session
    const untis = new WebUntis('Marie-Curie-Gym', username, password, 'herakles.webuntis.com')
    try {
        await untis.login() 
    } catch(err) {
        res.status(400).json({message: 'invalid credentials'})
        return undefined;
    }

    // return API session
    return untis
}

// login user + add to database if not already present
exports.login = async (req, res, next) => {
    // authenticate and start WebUntis API session
    untis = await this.authenticate(req, res)
    if (!untis) return; // abort if authentication was unsuccessful

    // get user data from WebUntis
    const students = await untis.getStudents()
    const student = students.filter(student => student.id == untis.sessionInformation.personId)[0]
    const studentClass = await getStudentClass(untis)
    const user = {
        username: student.name,
        firstname: student.foreName,
        lastname: student.longName,
        class: studentClass.name
    }

    // exit WebUntis API session
    await untis.logout()

    // add user to database if not already present
    connection.query(`SELECT * FROM user WHERE username = "${user.username}"`, async (err, data, fields) => {
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