import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.name = 'AppError';
    this.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
    this.status = StatusCodes.NOT_FOUND;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message);
    this.status = StatusCodes.BAD_REQUEST;
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message);
    this.status = StatusCodes.CONFLICT;
  }
}

export class AuthorizationError extends AppError {
  constructor(message?: string) {
    super(message || getReasonPhrase(StatusCodes.UNAUTHORIZED));
    this.status = StatusCodes.UNAUTHORIZED;
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(message || getReasonPhrase(StatusCodes.FORBIDDEN));
    this.status = StatusCodes.FORBIDDEN;
  }
}
