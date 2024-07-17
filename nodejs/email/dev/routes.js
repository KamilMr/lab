import {Router} from 'express';

import fs from 'fs';
import hb from 'handlebars';
import main from '../email/mailerSMTP.js';

const router = Router();


router.post('/email/:v', async (req, res, next) => {
  const {email, code, name, subject} = req.body;
  const {v: version } = req.params;
  const v = {
    otc:'./template/otc.hbs',
    welcome: './template/welcome.hbs'
  }

  if (!v[version]) return next('version_not_exists');

  const file = fs.readFileSync(v[version], 'utf8');
  const tmpl = hb.compile(file);

  try {
    await main(email, subject, tmpl({name, code}));
  } catch (err) {
    console.log(err);
    return res.status(500).send('Int_err');
  }

  res.send('ok');
});

router.post('/build/email/:v', async (req, res, next) => {
  const {email, code, name, subject} = req.body;
  const {v: version } = req.params;
  const v = {
    otc:'./template/otc.hbs',
    welcome: './template/welcome.hbs'
  }

  if (!v[version]) return next('version_not_exists');

  const file = fs.readFileSync(v[version], 'utf8');
  const tmpl = hb.compile(file);

  res.send(tmpl({name, code}));
});


export default router;
