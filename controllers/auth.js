const { WebUntis } = require('webuntis');

// DATABASE
const connection = require('../services/db')

exports.signup = async (req, res, next) => {
    // get credentials from request body
    const username = req.body['username']
    const password = req.body['password']

    // check WebUntis credentials and login
    const untis = new WebUntis('Marie-Curie-Gym', username, password, 'herakles.webuntis.com')
    await untis.login()

    // check if user already exists in database
    connection.query(`SELECT * FROM user WHERE username = "${username}"`, async (err, data, fields) => {
        if (err) next(err)
        if(data.length > 0) {
            res.status(400).json({message: 'user already exists'})
            return;
        } else {
            // get student data from WebUntis
            const students = await untis.getStudents()
            const student = students.filter(student => student.name == username)[0];
            
            // create new user in database
            connection.query(
                `INSERT INTO user(username, firstname, lastname, password) 
                VALUES ("${username}", "${student.foreName}", "${student.longName}", "${password}")`
            )

            res.json({message: 'user created'})

            // exit WebUntis session
            await untis.logout()
        }
    })
}