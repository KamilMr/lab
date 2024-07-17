import express from 'express';

import devRoutes from './dev/routes.js';
import verRoutes from './routes/ver.js';

const {ENV} = process.env;

const app = express();

app.use(express.json());

ENV === 'dev' && app.use('/dev', devRoutes);
app.use('/', verRoutes);

app.get('/main', (req, res) => {
  const {name} = req.query;
  res.send(`<h1>Welcome ${name}</h1>`);
});

app.use((err, req, res, next) => {
  console.log(err)
  res.send(err);
});

export default app;
