import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import logEvents from '@/middlewares/logEvents';
import validateBody from '@/middlewares/validateBody';
import verifyToken from '@/middlewares/verifyToken';
import errorHandler from '@/middlewares/errorHandler';
import swaggerDocument from '@/common/swagger.json';
import corsOptions from '@/common/corsOptions';
import authRouter from '@/resources/auth/authRouter';
import userRouter from '@/resources/user/userRouter';
import projectRouter from '@/resources/project/projectRouter';
import columnRouter from '@/resources/column/columnRouter';
import taskRouter from '@/resources/task/taskRouter';

const app = express();

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ strict: true }));
app.use(validateBody);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(logEvents);
app.use('/auth', authRouter);
app.use('/users', verifyToken, userRouter);
app.use('/projects', verifyToken, projectRouter);
app.use('/columns', verifyToken, columnRouter);
app.use('/tasks', verifyToken, taskRouter);
app.use(errorHandler);
app.get('*', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send(ReasonPhrases.NOT_FOUND);
});

export default app;
