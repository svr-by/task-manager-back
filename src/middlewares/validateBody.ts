import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@/common/appError';
import { COMMON_ERR_MES } from '@/common/errorMessages';

const validateBody = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (req.is('application/json')) {
    try {
      JSON.parse(req.body);
      next();
    } catch (error) {
      throw new BadRequestError(COMMON_ERR_MES.JSON_INVALID);
    }
  } else {
    next();
  }
};

export default validateBody;
