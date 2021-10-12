import videos from './videos'
import auth from './auth'

const router = app => {

    const p = path => `/api/v1${path}`

    app.use(p('/video'), videos)
    app.use(p('/auth'), auth)

}

export default router