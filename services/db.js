const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'mcg-app'
})

connection.connect()

module.exports = connection;