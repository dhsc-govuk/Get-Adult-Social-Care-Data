import winston from 'winston';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

// Console-friendly logs for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(), // Add colors to log levels
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    // Custom format: [timestamp] [level]: message {optional structured data}
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : ''; // Pretty print meta
    return `${timestamp} ${level}: ${message} ${metaString}`;
  }),
  winston.format.errors({ stack: true }) // Still include stack traces for errors
);

// Structured logging for azure/otel
const otelFormat = winston.format.combine(
  winston.format.errors({ stack: true }), // Include stack traces for errors
  winston.format.json() // Output logs in JSON format for structured logging to Azure
);

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new OpenTelemetryTransportV3({
      format: otelFormat,
    }),
  ],
});

export default logger;
