// file: utils/logger.ts

import pino from 'pino';
import pretty from 'pino-pretty';

// Manually create the stream for pino-pretty
const stream = pretty({
  colorize: true,
  sync: true, // Use synchronous logging in development for more stable output
});

// Initialize pino with the stream if in development
const logger =
  process.env.NODE_ENV === 'development'
    ? pino({ level: 'info' }, stream)
    : pino({ level: 'info' }); // In production, use standard JSON logging

export default logger;