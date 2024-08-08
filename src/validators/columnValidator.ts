import {
  validateBodyTitle,
  validateBodyProjectId,
  validateBodyOrder,
  validateParamId,
} from '@/validators/commonValidator';

export const validateCreateColumnParams = () => [
  validateBodyTitle(),
  validateBodyProjectId(),
  validateBodyOrder(),
];

export const validateUpdateColumnParams = () => [validateParamId(), validateBodyTitle()];
