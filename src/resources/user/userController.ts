import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';

import { TUserUpdateInput } from '@/types/userType';
import { IProject } from '@/types/projectType';
import { ITask } from '@/types/taskType';
import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { NotFoundError, ForbiddenError } from '@/common/appError';
import { USER_ERR_MES } from '@/common/errorMessages';
import User from '@/resources/user/userModel';

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
  const user = await User.findById(userId).populate(
    'projects ownProjects assigneeTasks subscriberTasks'
  );
  if (!user) {
    throw new NotFoundError(USER_ERR_MES.NOT_FOUND);
  }
  const buffer: (IProject | ITask)[] = [];
  if (user.ownProjects?.length) {
    throw new ForbiddenError(USER_ERR_MES.HAVE_PROJECTS);
  }
  if (user.projects?.length) {
    user.projects.forEach((project) => {
      (project.membersRefs as Types.ObjectId[]) = (project.membersRefs as Types.ObjectId[]).filter(
        (memberRef) => memberRef.toString() !== userId
      );
      buffer.push(project);
    });
  }
  if (user.assigneeTasks?.length) {
    user.assigneeTasks.forEach((task) => {
      task.assigneeRef = undefined;
      buffer.push(task);
    });
  }
  if (user.subscriberTasks?.length) {
    user.subscriberTasks.forEach((task) => {
      (task.subscribersRefs as Types.ObjectId[]) = (
        task.subscribersRefs as Types.ObjectId[]
      ).filter((subsRef) => subsRef.toString() !== userId);
      buffer.push(task);
    });
  }
  await Promise.all([User.findByIdAndDelete(userId), ...buffer.map((doc) => doc.save())]);
  res.sendStatus(StatusCodes.NO_CONTENT);
});
