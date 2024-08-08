import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { EntityExistsError, NotFoundError, ForbiddenError } from '@/common/appError';
import { COLUMN_ERR_MES, PROJECT_ERR_MES } from '@/common/errorMessages';
import { TColumnCreateInput } from '@/types/columnType';
import config from '@/common/config';
import Project from '@/models/projectModel';
import Column from '@/models/columnModel';

const { MAX_COLUMN_NUMBER_PER_PROJECT } = config;

export const createColumn = asyncErrorHandler(
  async (req: Request<{}, {}, TColumnCreateInput>, res: Response) => {
    validationErrorHandler(req);
    const { title, projectId, order } = req.body;
    const [project, projectColumnCount, duplColumn] = await Promise.all([
      Project.findById(projectId),
      Column.countDocuments({ projectRef: projectId }),
      Column.findOne({ projectRef: projectId, $or: [{ title }, { order }] }),
    ]);
    if (!project) {
      throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND);
    }
    const userId = req.userId;
    const hasAccess = project.checkUserAccess(userId);
    if (!hasAccess) {
      throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
    }
    if (projectColumnCount >= MAX_COLUMN_NUMBER_PER_PROJECT) {
      throw new ForbiddenError(COLUMN_ERR_MES.NUMBER_EXCEEDED);
    }
    if (duplColumn) {
      throw new EntityExistsError(COLUMN_ERR_MES.TITLE_EXIST);
    }
    const newColumn = await Column.create({ title, projectRef: projectId, order });
    res.status(StatusCodes.CREATED).json(newColumn);
  }
);

export const getColumn = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const columnId = req.params.id;
  const column = await Column.findById(columnId);
  if (!column) {
    throw new NotFoundError(COLUMN_ERR_MES.NOT_FOUND);
  }
  const userId = req.userId;
  const hasAccess = await column.checkUserAccess(userId);
  if (!hasAccess) {
    throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
  }
  res.json(column);
});
