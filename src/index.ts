import http from 'http';
import mongoose from 'mongoose';

import app from '@/app';
import config from '@/common/config';
import { logger } from '@/middlewares/logEvents';

const { PORT, MONGO_CONNECTION_STRING } = config;

const server = http.createServer(app);

(async () => {
  try {
    if (MONGO_CONNECTION_STRING) {
      await mongoose.connect(MONGO_CONNECTION_STRING);
      logger.info('Successfully connect to DB');
    } else {
      logger.info('Mongo connection string is not defined');
    }

    server.listen(PORT, () => {
      logger.info(`Server started at ${PORT}`);
    });
  } catch (err) {
    logger.error(`Server error: ${(err as Error).message}`);
  }
})();

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit();
});
