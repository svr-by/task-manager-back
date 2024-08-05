import { body } from 'express-validator';
import { USER_ERR_MES } from '@/common/errorMessages';
import { NAME_REGEX } from '@/common/regex';
import config from '@/common/config';

const { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = config;

export const validateBodyName = () =>
  body('name', USER_ERR_MES.NAME_EPMTY)
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: 3, max: 50 })
    .withMessage(USER_ERR_MES.NAME_LENGTH)
    .matches(NAME_REGEX)
    .withMessage(USER_ERR_MES.NAME_INVALID);

export const validateBodyEmail = () =>
  body('email', USER_ERR_MES.EMAIL_EPMTY)
    .trim()
    .toLowerCase()
    .notEmpty()
    .isEmail()
    .withMessage(USER_ERR_MES.EMAIL_INVALID);

export const validateBodyPwd = () =>
  body('password', USER_ERR_MES.PWD_EPMTY)
    .isString()
    .trim()
    .notEmpty()
    .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
    .withMessage(USER_ERR_MES.PWD_INVALID);

export const validateSignUpParams = () => [
  validateBodyName(),
  validateBodyEmail(),
  validateBodyPwd(),
];

export const validateSignInParams = () => [validateBodyEmail(), validateBodyPwd()];
