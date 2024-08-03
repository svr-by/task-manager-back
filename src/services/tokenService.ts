import jwt from 'jsonwebtoken';
import config from '@/common/config';

import { TTknPayload } from '@/types/userTypes';

const {
  JWT_CONFIRMATION_KEY,
  JWT_SECRET_KEY,
  JWT_EXPIRE_TIME,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_EXPIRE_TIME,
} = config;

const getToken = (payload: TTknPayload, secretKey?: string, expiresIn?: number) => {
  return secretKey && jwt.sign(payload, secretKey, (expiresIn && { expiresIn }) as jwt.SignOptions);
};

const decodeToken = (token: string, secretKey?: string, options?: jwt.VerifyOptions) => {
  try {
    const decoded = secretKey && jwt.verify(token, secretKey, options);
    return decoded as TTknPayload | undefined;
  } catch (error) {
    return;
  }
};

export const getConfToken = (payload: TTknPayload) => {
  return getToken(payload, JWT_CONFIRMATION_KEY);
};

export const decodeConfToken = (token: string, options?: jwt.VerifyOptions) => {
  return decodeToken(token, JWT_CONFIRMATION_KEY, options);
};

export const getAccToken = (payload: TTknPayload) => {
  return getToken(payload, JWT_SECRET_KEY, JWT_EXPIRE_TIME);
};

export const decodeAccToken = (token: string, options?: jwt.VerifyOptions) => {
  return decodeToken(token, JWT_SECRET_KEY, options);
};

export const getRfrToken = (payload: TTknPayload) => {
  return getToken(payload, JWT_REFRESH_SECRET_KEY, JWT_REFRESH_EXPIRE_TIME);
};

export const decodeRfrToken = (token: string, options?: jwt.VerifyOptions) => {
  return decodeToken(token, JWT_REFRESH_SECRET_KEY, options);
};
