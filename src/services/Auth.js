import User from '../models/User.model';
import jwt from 'jsonwebtoken';

import { isEmail, isAlphanumeric } from 'validator';

const secret = process.env.JWT_SECRET

async function login (req, res, next) {

    const _DAY = 86400;

    const token = jwt.sign({ id: req.user._id, username: req.user.username }, secret, { expiresIn: _DAY * 7 });

    return res.status(200).send({token, username: req.user.username});
}

async function register(req, res) {

    const { username, email, password } = req.body;

    const err = [];

    if(!username)
        err.push({'username': 'noUsername'})
    else if(username.length < 3 || username.lenght > 20)
        err.push({'username': 'usernameLength'});
    else if(!isAlphanumeric(username))
        err.push({'username' : 'usernameAlphanumeric'});

    if(!email)
        err.push({'email': 'noEmail'})
    else if(!isEmail(email))
        err.push({'email' : 'emailFormat'});

    if(!password)
        err.push({'password': 'noPassword'})
    else if(password.length <= 6)
        err.push({'password' : 'passwordLength'});

    if(err.length === 0) {
        const _email = req.body.email.toLowerCase()

        const response = await
            User.findOne({ email: _email })

        if(response) {

            if(response.email === _email) {
                err.push({'email' : 'emailTaken'});
            }

            res.status(400).json({ok: false, err: err});

        } else {
            const user = new User({ username, email, password });

            await User.register(user, password);

            res.status(200).json({ok: true});
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