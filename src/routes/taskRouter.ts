import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import {
  validateCreateTaskParams,
  validateUpdateTaskParams,
  validateUpdateTaskSetParams,
} from '@/validators/taskValidator';
import { createTask, getTask, updateTask, updateTaskSet } from '@/controllers/taskController';

const taskRouter = express.Router();

taskRouter.post('/', validateCreateTaskParams(), createTask);
taskRouter.patch('/', validateUpdateTaskSetParams(), updateTaskSet);
taskRouter.get('/:id', validateParamId(), getTask);
taskRouter.put('/:id', validateUpdateTaskParams(), updateTask);

export default taskRouter;
