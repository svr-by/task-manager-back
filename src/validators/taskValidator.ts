import { body } from 'express-validator';
import {
  validateParamId,
  validateBodyTitle,
  validateBodyOrder,
  validateBodyDesc,
} from '@/validators/commonValidator';
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
