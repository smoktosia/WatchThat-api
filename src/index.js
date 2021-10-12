import {} from 'dotenv/config'

import express from 'express'
import path from 'path'

import { createServer } from 'http'
import { Server } from 'socket.io'

import database from './services/Database'
import router from './Routes/router'

import passport from './config/passport'

const app = express()

// Body parser
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// DISABLE x-powered-by (USE HELMET LATER)
app.disable('x-powered-by')

console.log(process.env.NODE_ENV )
if(process.env.NODE_ENV === 'production') {

    // static path for client
    app.use(express.static(path.join(__dirname, '../client/build')))

    // serve client
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname+'/client/build/index.html'))
    })

}


// connect to db
database()

// passport
passport()

// add routing
router(app)


const PORT = process.env.PORT || 5000

const httpServer = createServer(app)
const io = new Server(httpServer)

io.on('connection', socket => {
    console.log('connection')
})

httpServer.listen(PORT)

