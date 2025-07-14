import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Logger } from 'pino';
import { MessageEntry } from './message-entry.type';

@Injectable()
export class LoggerFactory extends PinoLogger {
  Information<T>(entry: MessageEntry<T>): void {
    const loggerChild = this.getLoggerWithChild(entry);
    if (entry.payload) {
      loggerChild.info({ payload: entry.payload }, entry.message);
    } else {
      loggerChild.info(entry.message);
    }
  }

  Error<T>(entry: MessageEntry<T>): void {
    const loggerChild = this.getLoggerWithChild(entry);
    if (entry.payload) {
      loggerChild.error({ payload: entry.payload }, entry.message);
    } else {
      loggerChild.error(entry.message);
    }
  }

  private getLoggerWithChild<T>(entry: MessageEntry<T>): Logger {
    const baseLogger = this.logger.child({
      EventId: entry.eventId ?? 'Unknown',
      context: entry.context ?? 'General',
    });

    return baseLogger;
  }
}
