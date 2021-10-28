import mongoose from 'mongoose'

import { c } from '../utils/color'

const { connect, connection } = mongoose

const connectionString = process.env.MONGO_URI


export default () => {

    connect(connectionString || '', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .catch(err => {
            // throw err to file or smth
        })

    connection.on('connected', () => {
        console.log(c.connected('Mongoose is connected'))
    })

    connection.on('error', err => {
        console.log(c.error(`Mongoose connection has occured "${err}" error`))
    })

    connection.on('disconnected', () => {
        console.log(c.disconnected('Mongoose connection is disconnected'))
    })

    process.on('SIGINT', () => {
        connection.close(() => {
            console.log(c.termination('Mongoose connection is disconnected due to application termination'))
            process.exit(0)
        })
    })

}