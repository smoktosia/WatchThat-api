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
        const roomId = '2137'

        // send random id (todo)
        socket.on('get room id', () => {

            socket.emit('room id', roomId)
        })

        // room join, room id is needed
        socket.on('room join', roomId => {
            console.log('a client wants to join room ' + roomId)
            socket.join(roomId)

            socket.emit('room joined', roomId)

            socket.to(roomId).emit('userConnected')
        })

        // change video
        socket.on('new video', data => {
            // socket.broadcast.to()
            console.log('user sent new video!')
            // const room = socket.rooms[1]

            socket.to(roomId).emit('new video', data)
        })

        // seek
        socket.on('seek', t => {
            socket.to(roomId).emit('seek', t)
        })

        // pause / unpause
        socket.on('playing', state => {
            socket.to(roomId).emit('playing', state)
        })


    })



}