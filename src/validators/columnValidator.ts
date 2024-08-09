import { body } from 'express-validator';
import {
  validateBodyTitle,
  validateBodyProjectId,
  validateBodyOrder,
  validateParamId,
} from '@/validators/commonValidator';
import { COLUMN_ERR_MES } from '@/common/errorMessages';

export const validateCreateColumnParams = () => [
  validateBodyTitle(),
  validateBodyProjectId(),
  validateBodyOrder(),
];

export const validateUpdateColumnParams = () => [validateParamId(), validateBodyTitle()];

export const validateUpdateColumnSetParams = () => [
  body().isArray({ min: 1 }).withMessage(COLUMN_ERR_MES.UPDATE_ARRAY),
  body('*').isObject().withMessage(COLUMN_ERR_MES.UPDATE_OBJECT),
  body('*.id').isMongoId().withMessage(COLUMN_ERR_MES.ID_INVALID),
  body('*.order').isInt({ min: 0 }).withMessage(COLUMN_ERR_MES.UPDATE_ORDER),
];
