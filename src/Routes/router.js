import videos from './videos'

const router = app => {

    const p = path => `/api/v1${path}`

    app.use(p('/video'), videos)

}

export default router