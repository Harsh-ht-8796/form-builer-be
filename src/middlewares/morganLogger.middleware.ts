// src/middlewares/morganLogger.middleware.ts
import morgan from 'morgan';

import logger from '@utils/logger';

// Define stream for morgan to write into winston at HTTP level
const stream = {
  write: (message: string) => logger.http(message.trim()),
};

// Skip logging in test env if you want
const skip = () => process.env.NODE_ENV === 'test';

// Use 'combined' format or customize
const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', { stream, skip });

export default morganMiddleware;
