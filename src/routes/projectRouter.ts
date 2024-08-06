import express from 'express';
import { validateCreateProjectParams } from '@/validators/projectValidator';
import { createProject, getAllProjects, getProject } from '@/controllers/projectController';
import { validateParamId } from '@/validators/commonValidator';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);
projectsRouter.get('/', getAllProjects);
projectsRouter.get('/:id', validateParamId(), getProject);

export default projectsRouter;
