import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

import { log } from './helpers'

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
            const verify = jwt.verify(token, process.env.JWT_SECRET)
            if(!!verify) {
                log(`user ${verify.id} authed`)
                socket.user = verify.id
                return next()
            }
        }

        log('user not authed')

        next()
    })


    io.on('connection', socket => {

        const handlers = getHandlers(io, socket)

        // room actions
        socket.on('room_join', handlers.roomJoin)
        socket.on('room_leave', handlers.roomLeave)
        socket.on('disconnect', handlers.roomLeave)

        // video actions
        socket.on('new video', handlers.newVideo)
        socket.on('playing state', handlers.playingState)
        socket.on('seek', handlers.seek)
        socket.on('send video state', handlers.sendVideoState)

    })

}

