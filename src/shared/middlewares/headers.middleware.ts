import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Constants } from '../environment/constants';
import { randomUUID } from 'crypto';

export class HeaadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const spanId = req.headers[Constants.SPAN_ID] as string | undefined;
    const transactionId = req.headers[Constants.TRANSACTION_ID] as
      | string
      | undefined;

    if (spanId) {
      res.setHeader(Constants.PARENT_ID, spanId);
    }

    req.headers[Constants.SPAN_ID] = randomUUID();
    if (transactionId) {
      res.setHeader(Constants.TRANSACTION_ID, transactionId);
    }

    res.setHeader(Constants.SPAN_ID, req.headers[Constants.SPAN_ID] as string);
    req.headers[Constants.CORRELATION_ID] = randomUUID();
    res.setHeader(
      Constants.CORRELATION_ID,
      req.headers[Constants.CORRELATION_ID] as string,
    );
    res.removeHeader('X-Powered-By');
    next();
  }
}
