import { validateBodyName, validateBodyEmail, validateBodyPwd } from '@/common/commonValidator';

export const validateSignUpParams = () => [
  validateBodyName(),
  validateBodyEmail(),
  validateBodyPwd(),
];

export const validateSignInParams = () => [validateBodyEmail(), validateBodyPwd()];
