import { Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthDto } from './health.dto';
import { ApiDocumentation } from '@shared/decorators/api.controller.decorator';

@ApiDocumentation()
export class HealthController {
  constructor() {}
  @Get()
  @HttpCode(HttpStatus.OK)
  getHealthCheck(): Promise<HealthDto> {
    return Promise.resolve({
      status: 'UP',
      uptime: process.uptime(),
      date: new Date().toISOString(),
    });
  }
}
