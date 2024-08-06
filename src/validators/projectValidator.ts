import { validateBodyTitle, validateBodyDesc } from './commonValidator';

export const validateCreateProjectParams = () => [
  validateBodyTitle(),
  validateBodyDesc().optional(),
];
