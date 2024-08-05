export enum COMMON_ERR_MES {
  DB_ERROR = 'Database access error',
  DB_ID_INVALID = 'Invalid database document ID',
}

export enum USER_ERR_MES {
  ACC_TKN_EXPIRED = 'Access token has expired',
  ACC_TKN_INVALID = 'Invalid access token',
  CONF_TKN_INVALID = 'Confirmation token is invalid',
  CONF_USER_NOT_FOUND = 'The user with this token not found',
  RFR_TKN_INVALID = 'Invalid refresh token',
  TKN_MISMATCH = 'Token mismatch',
  NAME_EPMTY = 'Name must not be empty',
  NAME_LENGTH = 'Name must be from 3 to 50 chars',
  NAME_INVALID = 'Name length is not valid',
  EMAIL_EXIST = 'User with this email already exists',
  EMAIL_NOT_FOUND = 'User with this email not found',
  EMAIL_EPMTY = 'Email must not be empty',
  EMAIL_INVALID = 'Invalid email',
  PWD_INCORRECT = 'Password is not correct',
  PWD_EPMTY = 'Password must not be empty',
  PWD_INVALID = 'Password length is not valid',
  NOT_CONFIRMED = 'User has not confirmed the email',
  NOT_FOUND = 'User not found',
  ACCESS_DENIED = 'Access to change other users is denied',
}
