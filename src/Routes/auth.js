import { Router } from 'express'
import passport from 'passport'

import AuthService from '../services/Auth'
import jwtAuth from '../middlewares/jwtAuth'

const api = Router()

api.get('/', jwtAuth, (req, res) => {
	res.json({auth: true})
})

api.post('/login', passport.authenticate('local', {session: false}), AuthService.login)

api.post('/register', AuthService.register, passport.authenticate('local', {session: false}), AuthService.login)

export default api