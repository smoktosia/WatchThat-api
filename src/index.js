import express from 'express'

import router from './Routes/router'

const app = express()

const PORT = 5000

app.use('/static', express.static('static'))

app.use('/api/', router)

app.listen(PORT, () => console.log(`API listening on ${PORT}`))