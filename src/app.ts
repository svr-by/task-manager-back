import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';

import logEvents from '@/middlewares/logEvents';
import verifyToken from '@/middlewares/verifyToken';
import errorHandler from '@/middlewares/errorHandler';
import swaggerDocument from '@/common/swagger.json';
import authRouter from '@/routes/authRouter';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(logEvents);
app.use('/auth', authRouter);
app.use(verifyToken);
app.use(errorHandler);
app.get('*', (req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND);
});

export default app;
