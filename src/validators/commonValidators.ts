import { param } from 'express-validator';
import { COMMON_ERR_MES } from '@/common/errorMessages';

export const validateParamId = () =>
  param('id').isMongoId().withMessage(COMMON_ERR_MES.DB_ID_INVALID);
