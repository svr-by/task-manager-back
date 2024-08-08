import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import {
  validateCreateColumnParams,
  validateUpdateColumnParams,
  validateUpdateColumnSetParams,
} from '@/validators/columnValidator';
import {
  createColumn,
  getColumn,
  updateColumn,
  updateColumnSet,
  deleteColumn,
} from '@/controllers/columnController';

const columnRouter = express.Router();

columnRouter.post('/', validateCreateColumnParams(), createColumn);
columnRouter.patch('/', validateUpdateColumnSetParams(), updateColumnSet);
columnRouter.get('/:id', validateParamId(), getColumn);
columnRouter.put('/:id', validateUpdateColumnParams(), updateColumn);
columnRouter.delete('/:id', validateParamId(), deleteColumn);

export default columnRouter;
