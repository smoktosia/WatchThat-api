import passport from 'passport'

const jwtAuth = (req, res, next) =>
    passport.authenticate('jwt', { session: false })(req, res, next)

export default jwtAuth