import { validateParamId } from '@/validators/commonValidators';
import { validateBodyName, validateBodyPwd } from '@/validators//authValidators';

export const validateUpdateUserParams = () => [
  validateParamId(),
  validateBodyName().optional(),
  validateBodyPwd().optional(),
];
