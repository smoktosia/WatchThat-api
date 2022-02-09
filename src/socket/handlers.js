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

                    // TODO: get members
                    console.log(socket.handshake.address)
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

                        saveDataToSocket(socket, room, username)

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
        if(!socket.room || !socket.room.clearId || !socket.id) return

        log(`${socket.username} leaves room ${socket.room ? socket.room.clearId : 'unknown'}`)

        try {

            const room = await Room.findOne({_id: socket.room._id})

            if(room) {

                if(!room.members) return

                const userIndex = findIndexInMembers(room, socket)

                log('userIndex: ', userIndex)

                if(userIndex < 0)
                    return

                if(room.members.length <= 1)
                    room.members = null
                else
                    room.members.splice(userIndex, 1)

                room.save()

                const clearId = socket.room.clearId

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

    const newVideo = async (data) => {
        if(!socket.room || !socket.username || !data || !data.url) return

        try {
            const room = await Room.findOne({_id: socket.room._id})

            if(!room)
                return

            if(!room.videos)
                room.videos = []

            console.log(data)
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

        console.log('aaaaaa')

        io.to(target).emit('set video state', {progress, playing, timestamp})
    }

    return {
        roomJoin, roomLeave,
        newVideo, playingState, seek,
        sendVideoState
    }
}



export default handlers