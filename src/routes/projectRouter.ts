import express from 'express';
import {
  validateCreateProjectParams,
  validateUpdateProjectParams,
} from '@/validators/projectValidator';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
} from '@/controllers/projectController';
import { validateParamId } from '@/validators/commonValidator';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);
projectsRouter.get('/', getAllProjects);
projectsRouter.get('/:id', validateParamId(), getProject);
projectsRouter.put('/:id', validateUpdateProjectParams(), updateProject);

export default projectsRouter;
