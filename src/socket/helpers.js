const log = (...args) => console.log('[socket]', ...args)

const findIndexInMembers = (room, {user, id}) => {

    if(!room.members || !Array.isArray(room.members))
        return -1

    return room.members.findIndex(({socket_id, user_id}) => {
        if(user && user_id)
            return user_id.equals(user)
        return socket_id === id

    })

}

export { log, findIndexInMembers }