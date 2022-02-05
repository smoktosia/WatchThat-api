import mongoose, { Schema } from 'mongoose'

// const MemberSchema = new Schema({
//     username: {
//         type: String,
//         required: true,
//     },
//     user_id: {
//         type: mongoose.Types.ObjectId
//     },
//     socket_id: {
//         type: String,
//         required: true
//     }
// })

const RoomSchema = new Schema({
    clearId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    members: [
        {
            username: {
                type: String,
                required: true,
            },
            user_id: {
                type: mongoose.Types.ObjectId
            },
            socket_id: {
                type: String,
                required: true
            }
        }
    ],
    videos: [
        {
            username: {
                type: String,
                required: true,
            },
            user_id: {
                type: mongoose.Types.ObjectId
            },
            data: {
                url: [String],
                indirect: Boolean,
                hostname: String
            }

        }
    ],
}, { timestamps: true, collection: 'Rooms' })

export default mongoose.model('Room', RoomSchema)

// export { MemberSchema }