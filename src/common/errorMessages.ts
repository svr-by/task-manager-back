export enum COMMON_ERR_MES {
  DB_ERROR = 'Database access error',
  DB_ID_INVALID = 'Invalid database document ID',
  TITLE_STRING = 'Title must be string',
  TITLE_LENGTH = 'Title length is not valid',
  TITLE_CHARS = 'Title chars is not valid',
  DESC_STRING = 'Description must be string',
  DESC_LENGTH = 'Description length is not valid',
}

export enum USER_ERR_MES {
  ACC_TKN_EXPIRED = 'Access token has expired',
  ACC_TKN_INVALID = 'Invalid access token',
  CONF_TKN_INVALID = 'Confirmation token is invalid',
  CONF_USER_NOT_FOUND = 'The user with this token not found',
  RFR_TKN_INVALID = 'Invalid refresh token',
  TKN_MISMATCH = 'Token mismatch',
  NAME_STRING = 'Name must be string',
  NAME_LENGTH = 'Name length is not valid',
  NAME_CHARS = 'Name chars is not valid',
  EMAIL_EXIST = 'User with this email already exists',
  EMAIL_NOT_FOUND = 'User with this email not found',
  EMAIL_EPMTY = 'Email must not be empty',
  EMAIL_INVALID = 'Invalid email',
  PWD_INCORRECT = 'Password is not correct',
  PWD_STRING = 'Password must be string',
  PWD_LENGTH = 'Password length is not valid',
  NOT_CONFIRMED = 'User has not confirmed the email',
  NOT_FOUND = 'User not found',
  ACCESS_DENIED = 'Access to change other users is denied',
}

export enum PROJECT_ERR_MES {
  TITLE_EXIST = 'Project with this title already exists',
}
