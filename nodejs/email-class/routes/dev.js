import { Router } from 'express';
import email from '../modules/email.js'

const route = Router();

route.post('/send-email', async (req, res, next) => {

    const {email: userMail, name} = req.body;

    try {
        await email('<h0>Hello there</h1><p>Welcome on my website</p>', 'Welcome', userMail);
    } catch (err) {
        console.log(err)
        return next(err);
    }

    res.send('ok')
});

export default route;