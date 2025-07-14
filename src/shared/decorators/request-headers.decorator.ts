import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

interface HttpRequest {
  headers: Record<string, string | string[]>;
}

export const RequestHeaders = createParamDecorator(
  async (value: ClassConstructor<object>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<HttpRequest>();
    const headers = request.headers;
    const dto = plainToInstance(value, headers, {
      excludeExtraneousValues: true,
    });
    await validateOrReject(dto).catch(() => {
      throw new BadRequestException('Bad request headers');
    });
    return dto;
  },
);
