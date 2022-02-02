import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

import getHandlers from './handlers'


export default httpServer => {

    const io = new Server(httpServer, {
        path: '/socket',
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    })

    io.use((socket, next) => {
        const token = socket.handshake.auth.token

        if(token) {
            console.log('user authed')
            console.log(jwt.verify(token, process.env.JWT_SECRET))
        }
        else console.log('user not authed')

        next()
    })


    io.on('connection', socket => {

        const handlers = getHandlers(socket)

        socket.on('room_join', handlers.roomJoin)

        socket.on('room_leave', handlers.roomLeave)

        // socket.on('disconnect', handlers.roomLeave)
        socket.on('disconnect', (reason) => {
            console.log(reason)
        })

    })

}

