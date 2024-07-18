import { Router } from 'express';
import email from '../modules/email.js'

const route = Router();

route.post('/send-email', async (req, res, next) => {

    const {email: userMail, name} = req.body;
    const code = 'abcd';

    try {
        await email(`<h0>Hello there</h1><a href="http://localhost:3000/ver/code/${code}">Welcome on my website</a>`, 'Welcome', userMail);
    } catch (err) {
        console.log(err)
        return next(err);
    }

    res.send('ok')
});

route.get('/code/:code', async (req, res, next) => {

    const {code} = req.params



    res.send(code)
});

export default route;