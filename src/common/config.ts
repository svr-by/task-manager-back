import 'dotenv/config';
import path from 'path';

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOGS_DIR: path.join(__dirname, '../../logs'),
};

export default config;
