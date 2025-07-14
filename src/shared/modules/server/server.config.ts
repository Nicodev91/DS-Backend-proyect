import { Global, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { EnvValues } from '@shared/environment/config/env-values.config';
import { INFORMATION } from '@shared/environment/event-id.constants';
import { LoggerFactory } from '@shared/modules/logger/logger-factory';
import { ScalarClient } from '@shared/modules/scalar/scalar-client';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from 'src/app.module';

@Global()
export class Server {
  async setup(): Promise<void> {
    EnvValues.get();
    const app = await NestFactory.create(AppModule, { cors: true });
    new ScalarClient().register(app);
    app.useLogger(app.get(Logger));
    app.use(helmet());
    const basePath = EnvValues.get().GLOBAL_PREFIX;
    app.setGlobalPrefix(basePath, {
      exclude: [{ path: '/health', method: RequestMethod.ALL }],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    const customLogger = app.get(LoggerFactory);
    await app.listen(EnvValues.get().PORT).then(() => {
      customLogger.Information({
        message: `Server runing on port ${EnvValues.get().PORT}`,
        eventId: INFORMATION.MAIN_INITIALIZATION,
        context: 'Main',
      });
    });
  }
}
