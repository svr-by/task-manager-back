import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { TUserUpdateInput } from '@/types/userType';
import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { NotFoundError, ForbiddenError } from '@/common/appError';
import { USER_ERR_MES } from '@/common/errorMessages';
import User from '@/models/userModel';

export const getAllUsers = asyncErrorHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const users = await User.find({ _id: { $ne: userId } });
  res.json(users);
});

export const getUser = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const userId = req.params.id;
  const user = await User.findById(userId).populate('projects ownProjects');
  if (!user) {
    throw new NotFoundError(USER_ERR_MES.NOT_FOUND);
  }
  res.json(user);
});

export const updateUser = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TUserUpdateInput>, res: Response) => {
    validationErrorHandler(req);
    const userId = req.params.id;
    if (userId !== req.userId) {
      throw new ForbiddenError(USER_ERR_MES.ACCESS_DENIED);
    }
    const { name, password } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, password },
      { new: true }
    ).populate('projects ownProjects');
    if (!updatedUser) {
      throw new NotFoundError(USER_ERR_MES.NOT_FOUND);
    }
    res.json(updatedUser);
  }
);

export const deleteUser = asyncErrorHandler(async (req, res) => {
  validationErrorHandler(req);
  const userId = req.params.id;
  if (userId !== req.userId) {
    throw new ForbiddenError(USER_ERR_MES.ACCESS_DENIED);
  }
  //TODO: check user projects
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new NotFoundError(USER_ERR_MES.NOT_FOUND);
  }
  res.sendStatus(StatusCodes.NO_CONTENT);
});
