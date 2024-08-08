import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import {
  validateCreateColumnParams,
  validateUpdateColumnParams,
} from '@/validators/columnValidator';
import { createColumn, getColumn, updateColumn } from '@/controllers/columnController';

const columnRouter = express.Router();

columnRouter.post('/', validateCreateColumnParams(), createColumn);
columnRouter.get('/:id', validateParamId(), getColumn);
columnRouter.put('/:id', validateUpdateColumnParams(), updateColumn);

export default columnRouter;
