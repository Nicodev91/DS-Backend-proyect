import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerFactory } from '../modules/logger/logger-factory';
import { ERROR } from '../environment/event-id.constants';
import { GenericHttpExceptionDto } from './generic-http-exception.dto';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerFactory) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status: number;
    let message: string;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      this.logger.Error({
        message: String(exception),
        eventId: ERROR.UNEXPECTED,
        context: HttpExceptionFilter.name,
      });
    }
    const genericErrorResponse: GenericHttpExceptionDto = {
      code: String(status),
      message: message,
    };
    response.status(status).json(genericErrorResponse);
  }
}
