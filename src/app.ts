import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

export default app;