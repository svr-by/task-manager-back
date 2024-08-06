import express from 'express';
import {
  validateCreateProjectParams,
  validateUpdateProjectParams,
  validateInviteProjectParams,
} from '@/validators/projectValidator';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteUser,
} from '@/controllers/projectController';
import { validateParamId } from '@/validators/commonValidator';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);
projectsRouter.get('/', getAllProjects);
projectsRouter.get('/:id', validateParamId(), getProject);
projectsRouter.put('/:id', validateUpdateProjectParams(), updateProject);
projectsRouter.delete('/:id', validateParamId(), deleteProject);
projectsRouter.post('/:id/invite', validateInviteProjectParams(), inviteUser);

export default projectsRouter;
