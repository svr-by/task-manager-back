import { Response, Request } from 'express';

import { asyncErrorHandler } from '@/services/errorService';
import User from '@/models/userModel';

export const getAllUsers = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const users = await User.find({ _id: { $ne: userId } });
  res.json(users);
});
