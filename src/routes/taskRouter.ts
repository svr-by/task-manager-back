import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import {
  validateCreateTaskParams,
  validateUpdateTaskParams,
  validateUpdateTaskSetParams,
} from '@/validators/taskValidator';
import {
  createTask,
  getTask,
  updateTask,
  updateTaskSet,
  deleteTask,
  subscribeTask,
  unsubscribeTask,
} from '@/controllers/taskController';

const taskRouter = express.Router();

taskRouter.post('/', validateCreateTaskParams(), createTask);
taskRouter.patch('/', validateUpdateTaskSetParams(), updateTaskSet);
taskRouter.get('/:id', validateParamId(), getTask);
taskRouter.put('/:id', validateUpdateTaskParams(), updateTask);
taskRouter.delete('/:id', validateParamId(), deleteTask);
taskRouter.put('/:id/subscribe', validateParamId(), subscribeTask);
taskRouter.delete('/:id/subscribe', validateParamId(), unsubscribeTask);

export default taskRouter;
