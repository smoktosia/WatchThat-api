import videos from './videos'
import auth from './auth'
import room from './room'
import user from './user'

const router = app => {

    // const p = path => `/api/v1${path}`
    const use = (path, handler) => {
        app.use('/api/v1/' + path, handler)
    }

    use('video', videos)
    use('auth', auth)
    use('room', room)
    use('user', user)

    // app.use(p('/video'), videos)
    // app.use(p('/auth'), auth)
    // app.use(p('/room'), room)
    // app.use(p('/user'), user)

}

export default router