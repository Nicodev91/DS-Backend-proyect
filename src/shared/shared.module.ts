import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HeaadersMiddleware } from '@shared/middlewares/headers.middleware';
import { HttpCustomModule } from '@shared/modules/http/http-custom.module';
import { HealthModule } from '@shared/modules/health/health.module';
import { LoggerModule } from '@shared/modules/logger/logger.module';
import { ScalarModule } from '@shared/modules/scalar/scalar.module';

@Module({
  imports: [LoggerModule, HttpCustomModule, HealthModule, ScalarModule],
  exports: [LoggerModule, HttpCustomModule, HealthModule, ScalarModule],
})
export class SharedModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HeaadersMiddleware).forRoutes('*');
  }
}
