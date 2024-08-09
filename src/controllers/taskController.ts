import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { TTaskCreateInput, TTaskUpdateInput } from '@/types/taskType';
import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { EntityExistsError, NotFoundError, ForbiddenError } from '@/common/appError';
import { COLUMN_ERR_MES, PROJECT_ERR_MES, TASK_ERR_MES } from '@/common/errorMessages';
import config from '@/common/config';
import Column from '@/models/columnModel';
import Task from '@/models/taskModel';
import { sendUpdateTaskEmail } from '@/services/emailService';
import { IUser } from '@/types/userType';

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
