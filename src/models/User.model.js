import mongoose, { Schema } from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

const UserSchema = new Schema({
    username: {
        required: true,
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: Number,
        default: 0
    },

}, { timestamps: true, collection: 'Users' })

UserSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    usernameLowerCase: true
})

export default mongoose.model('User', UserSchema)