const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { client } = require('./db/index')
const loginRouter = require('./route/router')

const app = express()
const port = 5000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use('/', loginRouter)

client.connect()
.then(() => console.log("Connected successfully"))
.catch( e => console.log(e))

app.listen(port, () => console.log(`Example app listening on port ${port}`))