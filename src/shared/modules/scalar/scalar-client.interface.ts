import { INestApplication } from '@nestjs/common';

export interface ScalarClientInterface {
  register(app: INestApplication);
}
