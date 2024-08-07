import { validateBodyTitle, validateBodyProjectId, validateBodyOrder } from './commonValidator';

export const validateCreateColumnParams = () => [
  validateBodyTitle(),
  validateBodyProjectId(),
  validateBodyOrder(),
];
