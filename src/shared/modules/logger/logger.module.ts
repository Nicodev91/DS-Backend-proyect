import { TransportSingleOptions } from 'pino';
import { EnvValues } from '../../environment/config/env-values.config';
import { LoggerModule as LM } from 'nestjs-pino';
import * as dotenv from 'dotenv';
import { Global, Module } from '@nestjs/common';
import {
  REDACT_CENSOR,
  REDACT_PATHS,
} from '../../environment/redact.constants';
import { IncomingMessage } from 'http';
import { Constants } from '../../environment/constants';
import { LoggerFactory } from './logger-factory';
import { ERROR } from '@shared/environment/event-id.constants';

dotenv.config();

@Global()
@Module({
  imports: [
    LM.forRootAsync({
      useFactory: (): object => {
        try {
          const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
          const isLocal = EnvValues.get().ENV === 'local' || process.env.NODE_ENV === 'development';
          
          console.log('Logger Environment:', {
            ENV: EnvValues.get().ENV,
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            isVercel,
            isLocal
          });
        
          const config: any = {
            useLevel: 'info',
            messageKey: 'message',
            autoLogging: false,
            base: null,
            redact: {
              paths: REDACT_PATHS,
              censor: REDACT_CENSOR,
            },
            customProps: (req: IncomingMessage): object => ({
              consumer: req.headers[Constants.CHANNEL_ID],
              correlationId: req.headers[Constants.CORRELATION_ID],
              spanId: req.headers[Constants.SPAN_ID],
              parentId: req.headers[Constants.PARENT_ID],
              transactionId: req.headers[Constants.TRANSACTION_ID],
              type: EnvValues.get().TYPE,
              env: EnvValues.get().ENV,
              timestamp: Date.now(),
            }),
            formatters: {
              level: (label: string): object => ({
                level: undefined,
                severity: label.toUpperCase(),
              }),
            },
            serializers: {
              req: (): undefined => undefined,
              res: (): undefined => undefined,
            },
          };
          
          if (!isVercel && isLocal) {
            try {
              require.resolve('pino-pretty');
              config.transport = {
                target: 'pino-pretty',
                options: {
                  ignore: 'time',
                  messageKey: 'message',
                  singleLine: true,
                },
              };
              console.log('Added pino-pretty transport for local development');
            } catch (error) {
              console.log('pino-pretty not available, skipping transport');
            }
          } else {
            console.log('Using default logger (no transport) for production/Vercel');
          }
          
          return {
            pinoHttp: config,
          };
        } catch (error) {
          console.error('Logger initialization error:', error);
          console.error(ERROR.LOGGER_INITIALIZATION, error);
          throw error;
        }
      },
    }),
  ],
  providers: [LoggerFactory],
  exports: [LoggerFactory],
})
export class LoggerModule {}