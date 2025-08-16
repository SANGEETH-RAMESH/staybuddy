import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const errorLogPath = path.join('logs', 'error.log');
const combinedLogPath = path.join('logs', 'combined.log');


const logger = createLogger({
  levels: customLevels,
  level: 'http', 
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join('logs', 'combined.log') }),
  ],
});


if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}


export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

const clearLogs = () => {
  try {
    fs.writeFileSync(errorLogPath, '');
    fs.writeFileSync(combinedLogPath, '');
  } catch (err) {
    console.error('Error clearing logs:', err);
  }
};

setInterval(clearLogs, 60 * 60 * 1000);

export default logger;
