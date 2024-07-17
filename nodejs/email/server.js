import 'dotenv/config';

import app from './app.js';

const {PORT = 3001} = process.env;

app.listen(PORT, () => {
  console.log('Server is running on port ', PORT);
});
