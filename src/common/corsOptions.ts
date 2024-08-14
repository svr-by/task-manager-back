import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: ['https://tm.acsa.by', 'http://localhost:3000'],
  credentials: true,
};

export default corsOptions;
