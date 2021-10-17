import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt'

import bcrypt from 'bcrypt'
import User from '../models/User.model'

const secret = process.env.JWT_SECRET

const verifyCallback = (payload, done) => {

    if(!payload || !payload.id) return done(null)

    return User.findOne({_id: payload.id})
        .then(user => {
            return done(null, user)
        })
        .catch(err => {
            return done(err)
        })
}

const login = async (email, password, done) => {
    try {
        const user = await User.findOne({email})

        if(!user)
            return done(null, false)

        bcrypt.compare(password, user.password, (err, result) => {
            if(err)
                return done(err)
            if(!result)
                return done(null, false)
            return done(null, user)
        })

    } catch(err) {
        return done(err)
    }

}

export default () => {
    const config = {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, login))
    passport.use(new JwtStrategy(config, verifyCallback))
}