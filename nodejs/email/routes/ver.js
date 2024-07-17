import {Router} from 'express';

import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import hb from 'handlebars';
import main from '../email/mailerSMTP.js';

const router = Router();

const emails = {};

router.post('/email', async (req, res, next) => {
  const {email, name, subject = 'Veryfication email'} = req.body;

  const file = fs.readFileSync('./template/otc.hbs', 'utf8');
  const tmpl = hb.compile(file);

  const code = uuidv4();
  
  emails[email] = { verify: false, code, name};

  try {
    await main(email, subject, tmpl({name, code}));
  } catch (err) {
    console.log(err);
    return res.status(500).send('Int_err');
  }

  res.send('ok');
});

router.get('/code/:code', async (req, res, next) => {
  const code = req.params.code;

  console.log(typeof code)
  const email = Object.keys(emails).find(k => {
    return emails[k].code === code;
  })
  console.log(code, email, emails)

  if(!email) return next('no_ver')

  emails[email].verify = true;
  emails[email].code = null;

  const file = fs.readFileSync('./template/welcome.hbs', 'utf8');
  const tmpl = hb.compile(file);

  try {
    await main(email, 'Welcome', tmpl({name: emails[email].name}));
  } catch (err) {
    console.log(err);
    return res.status(498).send('Int_err');
  }

  res.redirect(`/main?name=${emails[email].name}`);
});
export default router;