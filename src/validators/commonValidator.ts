import { param, body } from 'express-validator';
import { COMMON_ERR_MES, USER_ERR_MES } from '@/common/errorMessages';
import { NAME_REGEX } from '@/common/regex';
import config from '@/common/config';

const { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = config;

export const validateParamId = () => param('id').isMongoId().withMessage(COMMON_ERR_MES.ID_INVALID);

export const validateParamUserId = () =>
  param('userId').isMongoId().withMessage(COMMON_ERR_MES.USER_ID_INVALID);

export const validateParamToken = () =>
  param('token')
    .isString()
    .withMessage(COMMON_ERR_MES.TOKEN_STRING)
    .trim()
    .notEmpty()
    .withMessage(COMMON_ERR_MES.TOKEN_EMPTY);

export const validateBodyName = () =>
  body('name')
    .isString()
    .withMessage(USER_ERR_MES.NAME_STRING)
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage(USER_ERR_MES.NAME_LENGTH)
    .matches(NAME_REGEX)
    .withMessage(USER_ERR_MES.NAME_CHARS);

export const validateBodyEmail = () =>
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage(USER_ERR_MES.EMAIL_EPMTY)
    .isEmail()
    .withMessage(USER_ERR_MES.EMAIL_INVALID);

export const validateBodyPwd = () =>
  body('password')
    .isString()
    .withMessage(USER_ERR_MES.PWD_STRING)
    .trim()
    .isLength({ min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH })
    .withMessage(USER_ERR_MES.PWD_LENGTH);

export const validateBodyTitle = () =>
  body('title')
    .isString()
    .withMessage(COMMON_ERR_MES.TITLE_STRING)
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage(COMMON_ERR_MES.TITLE_LENGTH)
    .matches(NAME_REGEX)
    .withMessage(COMMON_ERR_MES.TITLE_CHARS);

export const validateBodyDesc = () =>
  body('description')
    .isString()
    .withMessage(COMMON_ERR_MES.DESC_STRING)
    .trim()
    .isLength({ max: 100 })
    .withMessage(COMMON_ERR_MES.DESC_LENGTH);
