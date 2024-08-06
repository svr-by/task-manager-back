import {
  validateBodyTitle,
  validateBodyDesc,
  validateParamId,
  validateBodyEmail,
} from './commonValidator';

export const validateCreateProjectParams = () => [
  validateBodyTitle(),
  validateBodyDesc().optional(),
];

export const validateUpdateProjectParams = () => [
  validateParamId(),
  validateBodyTitle().optional(),
  validateBodyDesc().optional(),
];

export const validateInviteProjectParams = () => [validateParamId(), validateBodyEmail()];
