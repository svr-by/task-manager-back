import http from 'http';
import app from '@/app';
import config from '@/common/config';
import { logger } from '@/middlewares/logEvents';

const { PORT } = config;

const server = http.createServer(app);

(async () => {
  try {
    server.listen(PORT, () => {
      logger.info(`Server started at ${PORT}`);
    });
  } catch (err) {
    logger.error(`Server error: ${(err as Error).message}`);
  }
})();

process.on('SIGINT', async () => {
  process.exit();
});
