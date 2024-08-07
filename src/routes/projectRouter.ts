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
  joinProject,
} from '@/controllers/projectController';
import { validateParamId } from '@/validators/commonValidator';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);
projectsRouter.get('/', getAllProjects);
projectsRouter.get('/:id', validateParamId(), getProject);
projectsRouter.put('/:id', validateUpdateProjectParams(), updateProject);
projectsRouter.delete('/:id', validateParamId(), deleteProject);
projectsRouter.post('/:id/invite', validateInviteProjectParams(), inviteUser);
projectsRouter.get('/:id/join/:token', joinProject);

export default projectsRouter;
