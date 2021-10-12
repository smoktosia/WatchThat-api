import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt'

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

export default () => {
    const config = {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: secret
    }

    passport.use(User.createStrategy())
    passport.use(new JwtStrategy(config, verifyCallback))
}