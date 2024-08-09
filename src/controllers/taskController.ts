import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { TTaskCreateInput } from '@/types/taskType';
import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { EntityExistsError, NotFoundError, ForbiddenError } from '@/common/appError';
import { COLUMN_ERR_MES, PROJECT_ERR_MES, TASK_ERR_MES } from '@/common/errorMessages';
import config from '@/common/config';
import Column from '@/models/columnModel';
import Task from '@/models/taskModel';

const { MAX_TASK_NUMBER_PER_PROJECT } = config;

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
