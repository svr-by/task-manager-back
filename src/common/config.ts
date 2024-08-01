import 'dotenv/config';
import path from 'path';

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOGS_DIR: path.join(__dirname, '../../logs'),
  MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING,
};

export default config;
