import express from 'express';
import swaggerUi from 'swagger-ui-express';

import logEvents from '@/middlewares/logEvents';
import swaggerDocument from '@/common/swagger.json';

const app = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(logEvents);
app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

export default app;
