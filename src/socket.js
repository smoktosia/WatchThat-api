import { Server } from 'socket.io'

export default httpServer => {

    const io = new Server(httpServer, {
        path: '/socket',
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', socket => {
        console.log('connection')

        // idk
        // const roomId = '2137'

        // send random id (todo)
        socket.on('get room id', () => {

            const randomId = Math.random().toString(36).substring(2, 13)

            // socket.room = randomId

            socket.emit('room id', randomId)
        })

        // room join, room id is needed
        socket.on('room join', roomId => {
            console.log('a client wants to join room ' + roomId)


            socket.join(roomId)
            socket.room = roomId

            // const video = io.sockets.adapter.rooms.get(socket.room).video
            // if(video)
            //     socket.emit('room joined', {roomId, video})
            // else
                socket.emit('room joined', roomId)

            socket.to(roomId).emit('userConnected')
        })

        // change video
        socket.on('new video', data => {
            // socket.broadcast.to()
            if(!socket.room) return
            console.log('user sent new video!')
            // const room = socket.rooms[1]

            // console.log(socket.room , io.sockets.adapter.rooms.get(socket.room))
            // io.sockets.adapter.rooms.get(socket.room).video = data

            socket.to(socket.room).emit('new video', data)
        })

        // seek
        socket.on('seek', t => {
            socket.to(socket.room).emit('seek', t)
        })

        // pause / unpause
        socket.on('playing', state => {
            socket.to(socket.room).emit('playing', state)
        })

        // get watchtime after new user enter
        socket.on('get watchtime', () => {
            socket.to(socket.room).emit('get watchtime')
        })

        socket.on('send watchtime', ({video, data}) => {
            console.log(video, data)
        })


    })



}