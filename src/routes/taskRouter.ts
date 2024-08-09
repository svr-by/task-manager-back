import express from 'express';
import { validateCreateTaskParams } from '@/validators/taskValidator';
import { createTask } from '@/controllers/taskController';

const taskRouter = express.Router();

taskRouter.post('/', validateCreateTaskParams(), createTask);

export default taskRouter;
