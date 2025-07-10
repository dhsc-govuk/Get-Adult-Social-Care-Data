import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import winston from 'winston';

// Uses the winston/opentelemetry integration to allow specific log events
// to be sent to Azure App Insights
export const eventLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new OpenTelemetryTransportV3({}),
  ],
});
