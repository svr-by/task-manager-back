import winston from 'winston';
import morgan from 'morgan';
import { IncomingMessage } from 'http';
import config from '@/common/config';

const { NODE_ENV, LOGS_DIR } = config;
const { combine, timestamp, prettyPrint, colorize, printf } = winston.format;

export const logger = winston.createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), prettyPrint()),
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: `${LOGS_DIR}/app.log`,
      handleExceptions: true,
      maxsize: 1024 * 5000,
      maxFiles: 5,
    }),
    new winston.transports.File({
      level: 'error',
      filename: `${LOGS_DIR}/errors.log`,
      maxsize: 1024 * 5000,
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      level: 'error',
      filename: `${LOGS_DIR}/exceptions.log`,
      handleExceptions: true,
      maxsize: 1024 * 5000,
      maxFiles: 5,
    }),
  ],
});

// eslint-disable-next-line @typescript-eslint/no-shadow
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

if (NODE_ENV === 'development') {
  logger.add(
    new winston.transports.Console({
      format: combine(timestamp(), colorize(), consoleFormat),
      handleExceptions: true,
    })
  );
}

morgan.token('userId', (req: { userId: string } & IncomingMessage) => JSON.stringify(req.userId));

const logEvents = morgan(
  ':method :status :url :userId size req :req[content-length] res :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);

export default logEvents;
