import { Response, Request } from 'express';

import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { USER_ERR_MES } from '@/common/errorMessages';
import { NotFoundError } from '@/common/appError';
import User from '@/models/userModel';

export const getAllUsers = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const users = await User.find({ _id: { $ne: userId } });
  res.json(users);
});

export const getUser = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const userId = req.params.id;
  const user = await User.findById(userId).exec();
  if (!user) {
    throw new NotFoundError(USER_ERR_MES.CONF_USER_NOT_FOUND);
  }
  res.json(user);
});
