import { getReasonPhrase, StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  status?: number;

  constructor(message: string) {
    super(message);
    this.name = 'AppError';
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

export class EntityExistsError extends AppError {
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
