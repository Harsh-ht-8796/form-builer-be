// src/utils/logger.ts
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // default level
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), format.errors({ stack: true }), format.splat(), format.json()),
  transports: [new transports.File({ filename: 'logs/error.log', level: 'error' }), new transports.File({ filename: 'logs/combined.log' })],
});

// Console output in dev
if (process.env.NODE_ENV !== 'production') {
  console.log('Logger initialized');
  console.log({ NODE_ENV1: process.env.NODE_ENV });
  logger.info('✅ This is an info log');

  console.log(format.combine(format.colorize(), format.simple()));
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

export default logger;
