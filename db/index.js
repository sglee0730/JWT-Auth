const { Client } = require('pg')
const client = new Client({
    user: "postgres",
    password: "post",
    host: "localhost",
    port: 5432,
    database: "test"
})
const myQuery = {
    pgInsert: `INSERT INTO userschema(name, email, password, _id) VALUES($1, $2, $3, $4)`,
    pgFind: `SELECT * FROM userschema WHERE email = $1 `,
    pgUpdate: `UPDATE userschema SET token = $1 WHERE _id = $2`
}

module.exports = { client, myQuery }