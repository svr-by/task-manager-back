import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import { validateCreateTaskParams, validateUpdateTaskParams } from '@/validators/taskValidator';
import { createTask, getTask, updateTask } from '@/controllers/taskController';

const taskRouter = express.Router();

taskRouter.post('/', validateCreateTaskParams(), createTask);
taskRouter.get('/:id', validateParamId(), getTask);
taskRouter.put('/:id', validateUpdateTaskParams(), updateTask);

export default taskRouter;
