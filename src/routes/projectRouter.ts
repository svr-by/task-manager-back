import express from 'express';
import {
  validateCreateProjectParams,
  validateUpdateProjectParams,
  validateInviteUserParams,
  validateAcceptInvitationParams,
  validateDeleteMemberParams,
} from '@/validators/projectValidator';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  becomeMember,
  deleteMember,
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
projectsRouter.delete('/:id/member/:userId', validateDeleteMemberParams(), deleteMember);

export default projectsRouter;
