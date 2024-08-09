import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import { validateCreateTaskParams } from '@/validators/taskValidator';
import { createTask, getTask } from '@/controllers/taskController';

const taskRouter = express.Router();

taskRouter.post('/', validateCreateTaskParams(), createTask);
taskRouter.get('/:id', validateParamId(), getTask);

export default taskRouter;
