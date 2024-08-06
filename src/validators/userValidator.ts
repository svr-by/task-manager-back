import { validateParamId, validateBodyName, validateBodyPwd } from '@/validators/commonValidator';

export const validateUpdateUserParams = () => [
  validateParamId(),
  validateBodyName().optional(),
  validateBodyPwd().optional(),
];
