import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import { validateCreateColumnParams } from '@/validators/columnValidator';
import { createColumn, getColumn } from '@/controllers/columnController';

const columnRouter = express.Router();

columnRouter.post('/', validateCreateColumnParams(), createColumn);
columnRouter.get('/:id', validateParamId(), getColumn);

export default columnRouter;
