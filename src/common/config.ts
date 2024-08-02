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
};

export default config;
