import { body } from 'express-validator';
import {
  validateParamId,
  validateBodyTitle,
  validateBodyOrder,
  validateBodyDesc,
} from '@/common/commonValidator';
import { COLUMN_ERR_MES, TASK_ERR_MES } from '@/common/errorMessages';

export const validateCreateTaskParams = () => [
  validateBodyTitle(),
  validateBodyOrder(),
  body('columnId').isMongoId().withMessage(COLUMN_ERR_MES.ID_INVALID),
  body('assigneeId').isMongoId().withMessage(TASK_ERR_MES.ASSIGNE_ID).optional(),
  body('priority').isInt({ min: 0 }).withMessage(TASK_ERR_MES.PRIORITY_VALUE).optional(),
  validateBodyDesc().optional(),
];

export const validateUpdateTaskParams = () => [
  validateParamId(),
  validateBodyTitle().optional(),
  body('assigneeId').isMongoId().withMessage(TASK_ERR_MES.ASSIGNE_ID).optional({ nullable: true }),
  body('priority').isInt({ min: 0 }).withMessage(TASK_ERR_MES.PRIORITY_VALUE).optional(),
  validateBodyDesc().optional(),
];

export const validateUpdateTaskSetParams = () => [
  body().isArray({ min: 1 }).withMessage(TASK_ERR_MES.UPDATE_ARRAY),
  body('*').isObject().withMessage(TASK_ERR_MES.UPDATE_OBJECT),
  body('*.id').isMongoId().withMessage(TASK_ERR_MES.ID_INVALID),
  body('*.columnId').isMongoId().withMessage(COLUMN_ERR_MES.ID_INVALID),
  body('*.prevColumnId').isMongoId().withMessage(COLUMN_ERR_MES.ID_INVALID),
  body('*.order').isInt({ min: 0 }).withMessage(TASK_ERR_MES.UPDATE_ORDER),
  body('*.prevOrder').isInt({ min: 0 }).withMessage(TASK_ERR_MES.UPDATE_ORDER),
];
