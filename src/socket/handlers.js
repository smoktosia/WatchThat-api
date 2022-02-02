import Room from '../models/Room.model'

const log = (...args) => console.log('[socket]', ...args)

const handlers = (socket) => {
    const roomJoin = async ({clearId, username}) => {

        try {
            const room = await Room.findOne({clearId})

            if(!room)
                socket.emit('room_invalid')
            else {
                socket.emit('room_joined')
                socket.join(clearId)
                log(username)
                socket.to(clearId).emit('user_joined', username)

                socket.room = room._id
            }

        } catch(err) {
            console.error(err)
            socket.emit('room_error')
        }

    }

    const roomLeave = async () => {

        log('room leave')
        if(!socket.room) return

        try {
            const room = await Room.findOne({clearId: socket.room})

            if(room) {
                socket.emit('room_leaved')
                socket.leave(clearId)
                log(`${socket.id} leaved from ${clearId}`)
                socket.to(clearId).emit('user_leaved', socket.id)
                socket.room = null
            }

         } catch(err) {
                console.error(err)
            }

        }

    return { roomJoin, roomLeave }
}



export default handlers