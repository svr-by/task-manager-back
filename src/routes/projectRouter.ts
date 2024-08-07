import express from 'express';
import {
  validateCreateProjectParams,
  validateUpdateProjectParams,
  validateInviteUserParams,
  validateAcceptInvitationParams,
} from '@/validators/projectValidator';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  becomeMember,
} from '@/controllers/projectController';
import { validateParamId } from '@/validators/commonValidator';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);
projectsRouter.get('/', getAllProjects);
projectsRouter.get('/:id', validateParamId(), getProject);
projectsRouter.put('/:id', validateUpdateProjectParams(), updateProject);
projectsRouter.delete('/:id', validateParamId(), deleteProject);
projectsRouter.post('/:id/member', validateInviteUserParams(), inviteMember);
projectsRouter.get('/:id/member/:token', validateAcceptInvitationParams(), becomeMember);

export default projectsRouter;
