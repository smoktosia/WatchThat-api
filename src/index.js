import express from 'express'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'

import router from './Routes/router'

const app = express()

app.use(express.static(path.join(__dirname, '../client/build')))

// add routing
router(app)

// serve client
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'))
})


const PORT = process.env.PORT || 5000

const httpServer = createServer(app)
const io = new Server(httpServer)

io.on('connection', socket => {
    console.log('connection')
})

httpServer.listen(PORT)