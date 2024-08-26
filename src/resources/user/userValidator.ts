import { validateParamId, validateBodyName, validateBodyPwd } from '@/common/commonValidator';

export const validateUpdateUserParams = () => [
  validateParamId(),
  validateBodyName().optional(),
  validateBodyPwd().optional(),
];
