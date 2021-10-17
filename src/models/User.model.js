import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        required: true,
        type: String
    },

    role: {
        type: Number,
        default: 0
    },

}, { timestamps: true, collection: 'Users' })

export default mongoose.model('User', UserSchema)