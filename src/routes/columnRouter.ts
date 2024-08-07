import express from 'express';
import { createColumn } from '@/controllers/columnController';
import { validateCreateColumnParams } from '@/validators/columnValidator';

const columnRouter = express.Router();

columnRouter.post('/', validateCreateColumnParams(), createColumn);

export default columnRouter;
