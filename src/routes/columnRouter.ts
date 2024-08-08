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
} from '@/controllers/columnController';

const columnRouter = express.Router();

columnRouter.post('/', validateCreateColumnParams(), createColumn);
columnRouter.patch('/', validateUpdateColumnSetParams(), updateColumnSet);
columnRouter.get('/:id', validateParamId(), getColumn);
columnRouter.put('/:id', validateUpdateColumnParams(), updateColumn);

export default columnRouter;
