import http from 'http';
import app from '@/app';
import config from '@/common/config';

const { PORT } = config;

const server = http.createServer(app);

(async () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server started at ${PORT}`);
    });
  } catch (err) {
    console.log(`Server error: ${err}`);
  }
})();

process.on('SIGINT', async () => {
  process.exit();
});
