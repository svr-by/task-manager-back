import { Response, Request } from 'express';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';

import { ITask, TTaskCreateInput, TTaskUpdateInput, TTaskSetUpdateInput } from '@/types/taskType';
import { IUser } from '@/types/userType';
import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { sendUpdateTaskEmail, sendDeleteTaskEmail } from '@/services/emailService';
import { createDbId } from '@/services/databaseService';
import {
  EntityExistsError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/common/appError';
import { COLUMN_ERR_MES, PROJECT_ERR_MES, TASK_ERR_MES } from '@/common/errorMessages';
import config from '@/common/config';
import Column from '@/models/columnModel';
import Task from '@/models/taskModel';

const { NODE_ENV, MAX_TASK_NUMBER_PER_PROJECT } = config;

export const createTask = asyncErrorHandler(
  async (req: Request<{}, {}, TTaskCreateInput>, res: Response) => {
    validationErrorHandler(req);
    const { title, columnId, assigneeId, priority, order, description } = req.body;
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError(COLUMN_ERR_MES.NOT_FOUND);
    }
    const userId = req.userId;
    const hasAccess = await column.checkUserAccess(userId);
    if (!hasAccess) {
      throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
    }
    if (assigneeId) {
      const hasAssigneeAccess = await column.checkUserAccess(assigneeId);
      if (!hasAssigneeAccess) {
        throw new ForbiddenError(TASK_ERR_MES.ASSIGNE_NO_ACCESS);
      }
    }
    const [projectTaskCount, duplTask] = await Promise.all([
      Task.countDocuments({ projectRef: column.projectRef }),
      Task.findOne({
        $or: [
          { projectRef: column.projectRef, title },
          { columnRef: columnId, order },
        ],
      }),
    ]);
    if (projectTaskCount >= MAX_TASK_NUMBER_PER_PROJECT) {
      throw new ForbiddenError(TASK_ERR_MES.NUMBER_EXCEEDED);
    }
    if (duplTask) {
      throw new EntityExistsError(TASK_ERR_MES.REPEATED);
    }
    const newTask = await Task.create({
      title,
      projectRef: column.projectRef,
      columnRef: columnId,
      assigneeRef: assigneeId,
      priority,
      order,
      description,
    });
    res.status(StatusCodes.CREATED).json(newTask);
  }
);

export const getTask = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const taskId = req.params.id;
  const task = await Task.findById(taskId)
    .populate('assigneeRef', 'name email')
    .populate('subscriberRefs', 'name email');

  if (!task) {
    throw new NotFoundError(TASK_ERR_MES.NOT_FOUND);
  }
  const userId = req.userId;
  const hasAccess = await task.checkUserAccess(userId);
  if (!hasAccess) {
    throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
  }
  res.json(task);
});

export const updateTask = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TTaskUpdateInput>, res: Response) => {
    validationErrorHandler(req);
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    if (!task) {
      throw new NotFoundError(TASK_ERR_MES.NOT_FOUND);
    }
    const userId = req.userId;
    const hasAccess = await task.checkUserAccess(userId);
    if (!hasAccess) {
      throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
    }
    const { title, assigneeId, priority, description } = req.body;
    if (title) {
      const duplTask = await Task.findOne({ projectRef: task.projectRef, title });
      if (duplTask) {
        throw new EntityExistsError(TASK_ERR_MES.REPEATED);
      }
    }
    if (assigneeId) {
      const hasAssigneeAccess = await task.checkUserAccess(assigneeId);
      if (!hasAssigneeAccess) {
        throw new ForbiddenError(TASK_ERR_MES.ASSIGNE_NO_ACCESS);
      }
    }
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId },
      { title, assigneeRef: assigneeId, priority, description },
      { new: true }
    )
      .populate('assigneeRef', 'name email')
      .populate('subscriberRefs', 'name email');

    if (NODE_ENV !== 'test' && updatedTask?.subscriberRefs.length) {
      const taskUrl = `http://${req.headers.host}/tasks/${taskId}`;
      sendUpdateTaskEmail({
        subscribers: updatedTask.subscriberRefs as IUser[],
        taskUrl,
        title: updatedTask.title,
      });
    }
    res.json(updatedTask);
  }
);

export const updateTaskSet = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TTaskSetUpdateInput>, res: Response) => {
    validationErrorHandler(req);
    const userId = req.userId;
    const update = req.body;
    const tasksBuffer: ITask[] = [];
    let projectId;
    for (const updatedTask of update) {
      const { id, columnId, order } = updatedTask;
      const duplTask = tasksBuffer.find(
        (task) =>
          task._id.toString() === id ||
          (task.order === order && task.columnRef.toString() === columnId)
      );
      if (duplTask) {
        throw new BadRequestError(TASK_ERR_MES.UPDATE_REPEATED);
      }
      const task = await Task.findById(id);
      if (!task) {
        throw new NotFoundError(TASK_ERR_MES.NOT_FOUND);
      }
      if (!projectId) {
        projectId = task.projectRef.toString();
        const hasAccess = await task.checkUserAccess(userId);
        if (!hasAccess) {
          throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
        }
      } else if (task.projectRef.toString() !== projectId) {
        throw new BadRequestError(TASK_ERR_MES.SAME_PROJECT);
      }
      if (task.order !== order || task.columnRef.toString() !== columnId) {
        task.order = order;
        task.columnRef = createDbId(columnId);
        tasksBuffer.push(task);
      }
    }
    await Promise.all(tasksBuffer.map((task) => task.save()));
    if (NODE_ENV !== 'test') {
      for (const task of tasksBuffer) {
        await task.populate('assigneeRef subscriberRefs', 'name email');
        if (task.subscriberRefs.length) {
          const taskUrl = `http://${req.headers.host}/tasks/${task._id}`;
          sendUpdateTaskEmail({
            subscribers: task.subscriberRefs as IUser[],
            taskUrl,
            title: task.title,
          });
        }
      }
    }
    res.json(tasksBuffer);
  }
);

export const deleteTask = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const taskId = req.params.id;
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError(TASK_ERR_MES.NOT_FOUND);
  }
  const userId = req.userId;
  const hasAccess = await task.checkUserAccess(userId);
  if (!hasAccess) {
    throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
  }
  await Task.findByIdAndDelete(taskId);

  if (NODE_ENV !== 'test' && task.subscriberRefs.length) {
    await task.populate('subscriberRefs', 'email');
    sendDeleteTaskEmail({
      subscribers: task.subscriberRefs as IUser[],
      title: task.title,
    });
  }
  res.sendStatus(StatusCodes.NO_CONTENT);
});

export const subscribeTask = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const taskId = req.params.id;
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError(TASK_ERR_MES.NOT_FOUND);
  }
  const userId = req.userId;
  const hasAccess = await task.checkUserAccess(userId);
  if (!hasAccess) {
    throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
  }
  (task.subscriberRefs as Types.ObjectId[]).push(createDbId(userId));
  await task.save();
  res.sendStatus(StatusCodes.OK);
});

export const unsubscribeTask = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const taskId = req.params.id;
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError(TASK_ERR_MES.NOT_FOUND);
  }
  const userId = req.userId;
  const hasAccess = await task.checkUserAccess(userId);
  if (!hasAccess) {
    throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
  }
  (task.subscriberRefs as Types.ObjectId[]) = (task.subscriberRefs as Types.ObjectId[]).filter(
    (subsRef) => subsRef.toString() !== userId
  );
  await task.save();
  res.sendStatus(StatusCodes.NO_CONTENT);
});
