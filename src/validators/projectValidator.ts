import { validateBodyTitle, validateBodyDesc, validateParamId } from './commonValidator';

export const validateCreateProjectParams = () => [
  validateBodyTitle(),
  validateBodyDesc().optional(),
];

export const validateUpdateProjectParams = () => [
  validateParamId(),
  validateBodyTitle().optional(),
  validateBodyDesc().optional(),
];
