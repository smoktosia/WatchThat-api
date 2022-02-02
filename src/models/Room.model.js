import mongoose, { Schema } from 'mongoose'

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
            db_id: {
                type: mongoose.Types.ObjectId
            }
        }
    ],
}, { timestamps: true, collection: 'Rooms' })

export default mongoose.model('Room', RoomSchema)