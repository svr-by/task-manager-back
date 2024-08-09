export enum COMMON_ERR_MES {
  DB_ERROR = 'Database access error',
  ID_INVALID = 'ID param must be database document',
  USER_ID_INVALID = 'User ID must be database document',
  PROJECT_ID_INVALID = 'Project ID must be database document',
  TITLE_STRING = 'Title must be string',
  TITLE_LENGTH = 'Title length is not valid',
  TITLE_CHARS = 'Title chars is not valid',
  DESC_STRING = 'Description must be string',
  DESC_LENGTH = 'Description length is not valid',
  TOKEN_STRING = 'Token must be string',
  TOKEN_EMPTY = 'Token must not be empty',
  ORDER_VALUE = 'Order must be positive number',
}

export enum USER_ERR_MES {
  NOT_FOUND = 'User not found',
  NOT_FOUND_OR_NOT_VERIFIED = 'User not found or not verified',
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
  ACCESS_DENIED = 'Access to change other users is denied',
}

export enum PROJECT_ERR_MES {
  NOT_FOUND = 'Project not found',
  REPEATED = 'Title of the project must not be repeated',
  NO_ACCESS = 'Access to the project is denied',
  NOT_FOUND_OR_NO_ACCESS = 'Project not found or access denied',
  INV_TKN_EXPIRED = 'Invitation token is not valid or expired',
  INV_TKN_INCORRECT = 'Incorrect invite token',
  MEMBER_NOT_FOUND = 'Member not found',
}

export enum COLUMN_ERR_MES {
  NOT_FOUND = 'Column not found',
  REPEATED = 'Title of the column must not be repeated',
  NUMBER_EXCEEDED = 'Maximum number of columns in project exceeded',
  ID_INVALID = 'Column ID must be database document ID',
  UPDATE_ARRAY = 'Column update must be an array',
  UPDATE_OBJECT = 'Column data must be an object',
  UPDATE_ORDER = 'Column order must be a positive integer',
  UPDATE_REPEATED = 'Columns must not be repeated',
  SAME_PROJECT = 'Columns must belong to the same project',
}

export enum TASK_ERR_MES {
  NOT_FOUND = 'Task not found',
  REPEATED = 'Order or title of the task must not be repeated',
  NUMBER_EXCEEDED = 'Maximum number of tasks in project exceeded',
  ASSIGNE_ID = 'Assignee ID must be database document ID',
  ASSIGNE_NO_ACCESS = 'Assignee access to the project is denied',
  PRIORITY_VALUE = 'Priority must be a positive integer',
}
