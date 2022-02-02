import mongoose from 'mongoose'
import { Router } from 'express'

const router = new Router()

// import User from '../models/User.model'
import Username from '../models/Username.model'

router.get('/:id/username', async (req, res) => {
    const user_id = req.params.id

    if(!mongoose.Types.ObjectId.isValid(user_id))
        return res.status(400).json({ok: false, err: 'invalid_query'})

    const response = await Username.findOne({user_id})
    if(!response)
        return res.json({ok: false, err: 'no_user_found'})

    return res.status(200).json({ok: true, username: response.username})

})

export default router