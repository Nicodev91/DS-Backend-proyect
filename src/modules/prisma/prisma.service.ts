import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  handleError(error: Error): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new HttpException(
          `Unique constraint violation on: ${String(error.meta?.target)}`,
          HttpStatus.CONFLICT,
        );
      }
      if (error.code === 'P2025') {
        throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
      }
    }
    throw new HttpException(
      'Database operation failed',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
