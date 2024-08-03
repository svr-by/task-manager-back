import { CookieOptions } from 'express';
import config from '@/common/config';

const { JWT_REFRESH_EXPIRE_TIME } = config;

export const cookieOptions: CookieOptions = {
  sameSite: 'none',
  httpOnly: true,
  secure: true,
  maxAge: JWT_REFRESH_EXPIRE_TIME * 1000,
};
