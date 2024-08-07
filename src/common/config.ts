import 'dotenv/config';
import path from 'path';

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOGS_DIR: path.join(__dirname, '../../logs'),
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,
  JWT_CONFIRMATION_KEY: process.env.JWT_CONFIRMATION_SECRET_KEY,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_EXPIRE_TIME: 5 * 60 * 60,
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_EXPIRE_TIME: 5 * 24 * 60 * 60,
  JWT_INVITE_MEMBER_SECRET_KEY: process.env.JWT_INVITE_MEMBER_SECRET_KEY,
  JWT_INVITE_EXPIRE_TIME: 24 * 60 * 60,
  JWT_COOKIE_NAME: 'jwt',
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 25,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 0,
  AUTH_EMAIL_USERNAME: process.env.AUTH_EMAIL_USERNAME,
  AUTH_EMAIL_PASSWORD: process.env.AUTH_EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
};

export default config;
