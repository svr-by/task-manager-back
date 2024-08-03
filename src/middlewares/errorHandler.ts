import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import { AppError } from '@/common/appError';
import { COMMON_ERR_MES } from '@/common/errorMessages';
import { logger } from '@/middlewares/logEvents';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.status).send(err.message);
  } else if (err instanceof mongoose.Error) {
    console.log(err);
    logger.error(err.stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(COMMON_ERR_MES.DB_ERROR);
  } else {
    console.log(err);
    logger.error(err.stack);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(ReasonPhrases.INTERNAL_SERVER_ERROR);
  }
};

export default errorHandler;
