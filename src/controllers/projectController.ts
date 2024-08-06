import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { TProjectCreateInput } from '@/types/projectType';
import { PROJECT_ERR_MES } from '@/common/errorMessages';
import { EntityExistsError } from '@/common/appError';
import Project from '@/models/projectModel';

export const createProject = asyncErrorHandler(
  async (req: Request<{}, {}, TProjectCreateInput>, res: Response) => {
    validationErrorHandler(req);
    const { title, description } = req.body;
    const duplicateProject = await Project.findOne({ title }).exec();
    if (duplicateProject) {
      throw new EntityExistsError(PROJECT_ERR_MES.TITLE_EXIST);
    }
    const userId = req.userId;
    const newProject = await Project.create({ title, ownerRef: userId, description });
    //TODO: add default columns
    res.status(StatusCodes.CREATED).json(newProject);
  }
);
