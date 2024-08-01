import express from 'express';

import logEvents from '@/middlewares/logEvents';

const app = express();
app.use(logEvents);
app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

export default app;
