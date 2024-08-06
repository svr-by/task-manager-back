import express from 'express';
import { validateCreateProjectParams } from '@/validators/projectValidator';
import { createProject } from '@/controllers/projectController';

const projectsRouter = express.Router();

projectsRouter.post('/', validateCreateProjectParams(), createProject);

export default projectsRouter;
