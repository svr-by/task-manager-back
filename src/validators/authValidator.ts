import { validateBodyName, validateBodyEmail, validateBodyPwd } from '@/validators/commonValidator';

export const validateSignUpParams = () => [
  validateBodyName(),
  validateBodyEmail(),
  validateBodyPwd(),
];

export const validateSignInParams = () => [validateBodyEmail(), validateBodyPwd()];
