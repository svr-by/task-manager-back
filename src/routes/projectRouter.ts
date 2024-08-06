import express from 'express';
import { validateCreateProjectParams } from '@/validators/projectValidator';
import { createProject, getAllProjects } from '@/controllers/projectController';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);
projectsRouter.get('/', getAllProjects);

export default projectsRouter;
