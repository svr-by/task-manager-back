import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { COLUMN_ERR_MES, PROJECT_ERR_MES } from '@/common/errorMessages';
import {
  EntityExistsError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/common/appError';
import {
  IColumn,
  TColumnCreateInput,
  TColumnUpdateInput,
  TColumnSetUpdateInput,
} from '@/types/columnType';
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
      throw new EntityExistsError(COLUMN_ERR_MES.REPEATED);
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

export const updateColumn = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TColumnUpdateInput>, res: Response) => {
    validationErrorHandler(req);
    const columnId = req.params.id;
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError(COLUMN_ERR_MES.NOT_FOUND);
    }
    const projectId = column.projectRef.toString();
    const userId = req.userId;
    const { title } = req.body;
    const [hasAccess, duplColumn] = await Promise.all([
      column.checkUserAccess(userId),
      Column.findOne({ projectRef: projectId, title }),
    ]);
    if (!hasAccess) {
      throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
    }
    if (duplColumn) {
      throw new EntityExistsError(COLUMN_ERR_MES.REPEATED);
    }
    const updatedColumn = await Column.findOneAndUpdate(
      { _id: columnId },
      { title },
      { new: true }
    );
    res.json(updatedColumn);
  }
);

export const updateColumnSet = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TColumnSetUpdateInput>, res: Response) => {
    validationErrorHandler(req);
    const userId = req.userId;
    const update = req.body;
    const columnsBuffer: IColumn[] = [];
    let projectId;
    for (const updatedColumn of update) {
      const { id, order } = updatedColumn;
      const duplColumn = columnsBuffer.find(
        (column) => column._id.toString() === id || column.order === order
      );
      if (duplColumn) {
        throw new BadRequestError(COLUMN_ERR_MES.UPDATE_REPEATED);
      }
      const column = await Column.findById(id);
      if (!column) {
        throw new NotFoundError(COLUMN_ERR_MES.NOT_FOUND);
      }
      if (!projectId) {
        projectId = column.projectRef.toString();
        const hasAccess = await column.checkUserAccess(userId);
        if (!hasAccess) {
          throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
        }
      } else if (column.projectRef.toString() !== projectId) {
        throw new BadRequestError(COLUMN_ERR_MES.SAME_PROJECT);
      }
      if (column.order !== order) {
        column.order = order;
        columnsBuffer.push(column);
      }
    }
    await Promise.all(columnsBuffer.map((column) => column.save()));
    res.json(columnsBuffer);
  }
);

export const deleteColumn = asyncErrorHandler(async (req, res) => {
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
  await Column.findByIdAndDelete(columnId);
  //TODO: delete tasks of the column
  res.sendStatus(StatusCodes.NO_CONTENT);
});
