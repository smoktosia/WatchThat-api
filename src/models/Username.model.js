import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({

    username: {
        required: true,
        type: String,
        trim: true
    },

    user_id: {
        required: true,
        type: mongoose.Types.ObjectId,
        unique: true,
        ref: 'User'
    }

}, { collection: 'Usernames' })

export default mongoose.model('Username', UserSchema)