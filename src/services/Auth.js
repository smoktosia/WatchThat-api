import User from '../models/User.model';
import Username from '../models/Username.model'

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'

import { isEmail, isAlphanumeric } from 'validator';
import errors from '../config/errors.json'

const secret = process.env.JWT_SECRET

async function login (req, res) {

    const _DAY = 86400

    const token = jwt.sign({ id: req.user._id, username: req.user.username }, secret, { expiresIn: _DAY * 7 })

    return res.status(200).json({data: {token, _id: req.user._id}})
}

async function register(req, res, next) {

    const { username, email, password } = req.body

    const err = []

    if(!username)
        err.push({'username': errors.noUsername})
    else if(username.length < 3 || username.lenght > 20)
        err.push({'username': errors.usernameLength})
    else if(!isAlphanumeric(username))
        err.push({'username' : errors.usernameAlphanumeric})

    if(!email)
        err.push({'email': errors.noEmail})
    else if(!isEmail(email))
        err.push({'email' : errors.emailFormat})

    if(!password)
        err.push({'password': errors.noPassword})
    else if(password.length <= 6)
        err.push({'password' : errors.passwordLength})

    if(err.length === 0) {
        const _email = req.body.email.toLowerCase()

        const response = await
            User.findOne({ email: _email })

        if(response) {

            if(response.email === _email) {
                err.push({'email' : errors.emailTaken});
            }

            res.status(400).json({ok: false, err: err});

        } else {

            bcrypt.hash(password, 12, async (err, hash) => {
                if(err)
                    res.status(500).json({ok: false})
                else {
                    try {
                        const user = new User({ email, password: hash });

                        await user.save()

                        // res.status(200).json({ok: true})

                        // go and sign user in
                        next()

                        try {
                            if(user._id) {
                                const usernameModel = new Username({ user_id: user._id, username })

                                await usernameModel.save()
                            }

                        } catch(err) {
                            // nwm
                            console.log(err)
                        }


                    } catch(err) {
                        console.log(err)
                        res.status(500).json({ok: false})
                    }
                }
            })
        }

    } else {
        res.status(400).json({ok: false, err: err});
    }



}

async function taken(req, res) {

    try {
        const toCheck = req.body.username.toLowerCase();

        const response = await
        User.findOne({ email: toCheck })

        if(!response)
            return res.status(200).json({taken: false});

    } catch(err) {
        console.log(err);
    }

    return res.status(200).json({taken: true});


}



export default {
    login, register, taken
}