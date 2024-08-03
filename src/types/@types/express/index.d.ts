// eslint-disable-next-line import/no-unresolved, @typescript-eslint/no-unused-vars
import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    userId: string;
  }
}
