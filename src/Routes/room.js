import { Router } from 'express'

import errors from '../config/errors.json'
import Room from '../models/Room.model'

const router = new Router()

router.get('/generateId', async (req, res) => {
    let clearId

    for(let attemps = 10; attemps > 0; attemps--) {

        clearId = Math.random().toString(36).substring(2, 13)

        try {
            let res = await Room.findOne({clearId})

            if(!res) {

                const newRoom = new Room({clearId})
                await newRoom.save()

                break
            }
            else clearId = null

        } catch(err) {
            clearId = null
            console.error(err)
        }

    }

    if(clearId)
        return res.json({id: clearId})

    res.status(500).json({err: errors.cantGenerateId})
})

export default router