const express = require('express')
const router = express.Router()
const { client, myQuery } = require('../db/index')
const shortid = require('shortid')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10

router.get('/', (req, res) => res.send('Hello World~'))

router.get('/api/hello', (req, res) => {
    res.send('안녕하세요')
})

router.post('/api/users/register', (req,res) => {
    let encoded = req.body.password

    bcrypt.genSalt(saltRounds)
    .catch(err => res.json({ success: false, message: "genSalt error" }))
    .then((salt) => {
        bcrypt.hash(encoded, salt)
            .catch(err => res.json({ success: false, message: "hashing error" }))
            .then(hash => {
                encoded = hash
                console.log("hashing success")
                return encoded
            })
            .then(hashed => {
                client.query(myQuery.pgInsert, [req.body.name, req.body.email, hashed, shortid.generate()])
                    .then(result => {
                        res.status(200).json({ success: true })
                    })
                    .catch(e => {
                        console.log("Insert error")
                        res.json({ success: false, message: "Insert error" })
                    })
            })
    })
})

router.post('/api/users/login', (req,res) => {
    if (!req.body.password) {
        res.json({ message: "no password" })
    }

    client.query(myQuery.pgFind, [req.body.email])
    .then(result => {
        const user = result.rows[0]

        bcrypt.compare(req.body.password, user.password)
        .then(result => {
            const token = jwt.sign(user._id, 'secretToken')

            client.query(myQuery.pgUpdate, [token, user._id])
            .catch(err => res.status(400).send(err))
            .then(() => {
                res.cookie('x_auth', user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id  })
            })
        })
        .catch(err => {
            console.log('password not match')
            res.json({ loginSuccess: false, message: 'password not match' })
        })
        
    })
    .catch(err => {
        res.json({ loginSuccess: false, message: "No user" })
    })
})

router.get('/api/users/auth', (req, res) => {
    let token = req.cookies.x_auth

    jwt.verify(token, 'secretToken', (err, decoded) => {
        client.query("SELECT * FROM userschema WHERE _id = $1 AND token = $2", [decoded, token])
        .catch(err => {
            console.error(err)
            res.json({ isAuth: false, message: "Cannot find id or token"})
        })
        .then(result => {
            req.token = token
            res.status(200).json({ isAuth: true, message: "Authentication authorized" })
        })
    })
})

router.get('/api/users/logout', (req, res) => {
    let token = req.cookies.x_auth

    jwt.verify(token, 'secretToken', (err, decoded) => {
        client.query("SELECT * FROM userschema WHERE _id = $1 AND token = $2", [decoded, token])
        .catch(err => res.json({ isAuth: false, message: err }))
        .then(result => {
            client.query(`UPDATE userschema SET token = $1 WHERE _id = $2`, ["", decoded])
            .catch(err => res.json({ success: false, message: err }))
            .then(isUpdate => {
                res.json({ success: true, message: "Token successfully deleted" })
            })
        })
    })
})

module.exports = router
