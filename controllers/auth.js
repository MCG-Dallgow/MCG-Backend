const { WebUntis } = require('webuntis');

// DATABASE
const connection = require('../services/db')

async function getStudentClass(untis) {
    const classId = untis.sessionInformation.klasseId
    const classes = await untis.getClasses()
    return classes.filter((class_) => class_.id == classId)[0]
}

exports.signup = async (req, res, next) => {
    // get credentials from request body
    const username = req.body['username']
    const password = req.body['password']

    // check WebUntis credentials and login
    const untis = new WebUntis('Marie-Curie-Gym', username, password, 'herakles.webuntis.com')
    try {
        await untis.login() 
    } catch(err) {
        res.status(400).json({message: 'invalid credentials'})
        return;
    }

    // check if user already exists in database
    connection.query(`SELECT * FROM user WHERE username = "${username}"`, async (err, data, fields) => {
        if (err) next(err)
        if(data.length > 0) {
            res.status(400).json({message: 'user already exists'})
            await untis.logout()
            return;
        } else {
            // get student data from WebUntis
            const students = await untis.getStudents()
            const student = students.filter(student => student.name == username)[0]
            const studentClass = await getStudentClass(untis)
            
            // create new user in database
            connection.query(
                `INSERT INTO user(username, firstname, lastname, class) 
                 VALUES ("${username}", "${student.foreName}", "${student.longName}", "${studentClass.name}")`
            )

            res.json({message: 'user created'})

            // exit WebUntis session
            await untis.logout()
        }
    })
}