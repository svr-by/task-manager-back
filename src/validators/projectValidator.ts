import {
  validateParamId,
  validateParamToken,
  validateBodyTitle,
  validateBodyDesc,
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

export const validateInviteUserParams = () => [validateParamId(), validateBodyEmail()];

export const validateAcceptInvitationParams = () => [validateParamId(), validateParamToken()];
