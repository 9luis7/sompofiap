import winston from 'winston';
import path from 'path';
import { environment } from '../config/environment';

// Definir níveis de log personalizados
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
  }
};

// Adicionar cores aos níveis
winston.addColors(customLevels.colors);

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Adicionar metadata se existir
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    // Adicionar stack trace para erros
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// Criar transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: environment.logs.level,
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      customFormat
    )
  })
];

// Adicionar file transport se especificado
if (environment.logs.file) {
  const logDir = path.dirname(environment.logs.file);

  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: customFormat
    }),
    new winston.transports.File({
      filename: environment.logs.file,
      format: customFormat
    })
  );
}

// Criar logger
export const logger = winston.createLogger({
  levels: customLevels.levels,
  format: customFormat,
  defaultMeta: { service: 'sompo-monitoring-backend' },
  transports,
  exitOnError: false
});

// Métodos de conveniência
export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, meta);
};
