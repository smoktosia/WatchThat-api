import { isAlphanumeric } from 'validator'

import mongoose from 'mongoose'
import Room from '../models/Room.model'
import Username from '../models/Username.model'

import { log, findIndexInMembers } from './helpers'

const handlers = (io, socket) => {
    const roomJoin = async ({clearId, username}) => {

        try {

            if(socket.user) {

                const _username = await Username.findOne({user_id: socket.user})

                if(!_username)
                    return socket.emit('room_not_joined', 'unauthorized')

                username = _username.username
            }

            // validate username
            if(!username || username.length < 3 || username.lenght > 20 || !isAlphanumeric(username))
                return socket.emit('room_not_joined', 'username')

            const room = await Room.findOne({clearId})

            if(!room)
                socket.emit('room_invalid')
            else {

                const userIndex = findIndexInMembers(room, socket)

                const saveDataToSocket = (socket, room, username) => {
                    socket.room = {
                        _id: room._id,
                        clearId: room.clearId
                    }
                    socket.username = username

                    socket.join(clearId)

                    socket.emit('room_joined')
                    socket.to(clearId).emit('user_joined', {username, socketId: socket.id, _id: socket.user || null})

                    // get video
                    if(room.videos && room.videos.length > 0) {
                        const video = room.videos.at(-1)

                        socket.emit('set video', {video: video.data, username: video.username})

                        socket.to(socket.room.clearId).emit('get video state', socket.id)
                    }

                    // get members (+clear)
                    if(room.members && room.members.length > 0) {
                        (async () => {

                            let attemps = 10

                            while(attemps > 0) {
                                attemps--

                                try {
                                    const idsInSocket = []

                                    io.sockets.sockets.forEach((s) => {
                                        if(s.room && s.room.clearId === clearId)
                                            idsInSocket.push(s.id)
                                    })

                                    const notConnectedInDb = []
                                    room.members.forEach(({socket_id}, i) => {
                                        if(!idsInSocket.includes(socket_id))
                                            notConnectedInDb.push(i)

                                    })

                                    notConnectedInDb.forEach(index => {
                                        room.members.splice(index, 1)
                                    })

                                    const saved = await room.save()

                                    if(saved) {
                                        const members = []
                                        saved.members.forEach(({username, user_id, socket_id}) => {
                                            if(socket_id === socket.id)
                                                return
                                            members.push({username, socketId: socket_id, _id: user_id || null})
                                        })

                                        // if(members.length > 0)
                                        socket.emit('set_members_list', members)

                                        break
                                    }

                                } catch(err) {
                                    if(err.name === 'VersionError') {
                                        console.log(err.name)
                                        room = await Room.findOne({clearId})
                                        if(room) continue
                                        else return
                                    }
                                    else console.error(err)
                                }

                            }

                        })()
                    } else {
                        socket.emit('set_members_list', null)
                    }


                    // console.log(socket.handshake.address)
                }

                if(userIndex < 0) {
                    const member = {
                        username,
                        socket_id: socket.id
                    }
                    if(socket.user)
                        member.user_id = mongoose.Types.ObjectId(socket.user)

                    if(!room.members)
                        room.members = []

                    room.members.push(member)

                    const saved = await room.save()

                    if(saved) {
                        saveDataToSocket(socket, saved, username)
                    } else throw Error('room update error')
                } else {
                    saveDataToSocket(socket, room, username)
                }


            }

        } catch(err) {
            console.error(err)
            socket.emit('room_error')
        }

    }

    const roomLeave = async () => {
        if(!socket.room || !socket.room.clearId || !socket.room._id || !socket.id) return

        log(`${socket.username} leaves room ${socket.room ? socket.room.clearId : 'unknown'}`)

        try {

            const room_id = socket.room._id
            const socketId = socket.id
            const user_id = socket.user || null

            let room = await Room.findOne({_id: room_id})

            if(room) {

                let attemps = 10

                while(attemps > 0) {

                    attemps--

                    try {

                        if(!room.members || !Array.isArray(room.members)) return
                        const userIndex = findIndexInMembers(room, socket)

                        if(userIndex < 0)
                            return

                        if(room.members.length <= 1)
                            room.members = null
                        else
                            room.members.splice(userIndex, 1)

                        if(await room.save())
                            break


                    } catch(err) {

                        if(err.name === 'VersionError') {
                            room = await Room.findOne({_id: room_id})
                            if(room) continue
                            else return
                        }

                    }

                }

                const clearId = room.clearId

                socket.emit('room_leaved')
                socket.to(clearId).emit('user_leaved', {socketId, _id: user_id})
                socket.room = null

                socket.leave(clearId)
                log(`${socketId} leaved from ${clearId}`)

            }

         } catch(err) {
                console.error(err)
            }

        }

    const newVideo = async (data) => {
        if(!socket.room || !socket.username || !data || !data.url) return

        try {
            const room = await Room.findOne({_id: socket.room._id})

            if(!room)
                return

            if(!room.videos)
                room.videos = []

            room.videos.push({
                data,
                username: socket.username,
                user_id: socket.user || undefined
            })

            room.save()

            socket.to(socket.room.clearId).emit('set video', ({video: data, username: socket.username}))
        } catch(err) {
            console.error(err)
        }
    }

    const playingState = (state) => {
        if(!socket.room || !socket.username || typeof state === 'undefined') return
        socket.to(socket.room.clearId).emit('playing state', {state, username: socket.username})
    }

    const seek = (time) => {
        if(!socket.room || !socket.username || !time) return

        socket.to(socket.room.clearId).emit('seek', time)
    }

    const sendVideoState = ({progress, playing, target, timestamp}) => {
        if(!socket.room || !socket.username || !progress || !target || !timestamp || timestamp > Date.now()) return

        io.to(target).emit('set video state', {progress, playing, timestamp})
    }

    const sendMessage = (msg) => {
        if(!socket.room || !socket.username || !msg) return

        try {
            if(!msg.content || msg.content.trim().length < 1) 'message_content'
            if(!msg.socketId || msg.socketId !== socket.id) throw 'message_socket_id'
            if(!msg.username || msg.username !== socket.username) throw 'message_username'
            if(!msg.msgId) throw 'message_id'

            // send to others
            socket.to(socket.room.clearId).emit('message received', msg)
            // send to self
            socket.emit('message sent', msg.msgId)

        } catch(err) {
            console.log(err)
        }


    }

    return {
        roomJoin, roomLeave,
        newVideo, playingState, seek,
        sendVideoState,
        sendMessage
    }
}



export default handlers