import { InternalServerErrorException } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ERROR, INFORMATION } from '../event-id.constants';

dotenv.config();

export class EnvValues {
  ENV: string;
  TYPE: string;
  COMPONENT: string;
  PORT: number;
  GLOBAL_PREFIX: string;
  DATABASE_URL: string;
  DIRECT_URL: string;
  JWT_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;

  constructor() {
    this.ENV = this.validateValue<string>(process.env.ENV, 'ENV');
    this.TYPE = this.validateValue<string>(process.env.TYPE, 'TYPE');
    this.DIRECT_URL = this.validateValue<string>(
      process.env.DIRECT_URL,
      'DIRECT_URL',
    );
    this.COMPONENT = this.validateValue<string>(
      process.env.COMPONENT,
      'COMPONENT',
    );
    this.PORT = this.validateValue<number>(Number(process.env.PORT), 'PORT');
    this.GLOBAL_PREFIX = this.validateValue<string>(
      process.env.GLOBAL_PREFIX,
      'GLOBAL_PREFIX',
    );
    this.DATABASE_URL = this.validateValue<string>(
      process.env.DATABASE_URL,
      'DATABASE_URL',
    );
    this.JWT_SECRET = this.validateValue<string>(
      process.env.JWT_SECRET,
      'JWT_SECRET',
    );
    this.SMTP_HOST = this.validateValue<string>(
      process.env.SMTP_HOST || 'smtp.gmail.com',
      'SMTP_HOST',
    );
    this.SMTP_PORT = this.validateValue<number>(
      Number(process.env.SMTP_PORT) || 587,
      'SMTP_PORT',
    );
    this.SMTP_USER = this.validateValue<string>(
      process.env.SMTP_USER || '',
      'SMTP_USER',
    );
    this.SMTP_PASS = this.validateValue<string>(
      process.env.SMTP_PASS || '',
      'SMTP_PASS',
    );
    console.info(
      'Success environment intializaiton' +
        JSON.stringify({
          severity: 'INFO',
          EventId: INFORMATION.ENVIRONMENT_INITIALIZATION,
          context: EnvValues.name,
        }),
    );
    // TODO: Active only for local use. Remove bofere upload you code in production enviornment.
    process.env.NODE_TLS_REJECT_UNATHORIZED = '0';
  }
  private static instance: EnvValues;

  static get(): EnvValues {
    if (!EnvValues.instance) {
      EnvValues.instance = new EnvValues();
    }
    return EnvValues.instance;
  }

  private validateValue<T>(value: T | undefined, valueName: string): T {
    if (!value) {
      const errorMessage = `environmet value -> ${valueName}. not found`;
      console.error(
        errorMessage +
          ' ' +
          JSON.stringify({
            severity: 'ERROR',
            EventId: ERROR.ENVIRONMENT_INITIALIZATION,
            context: EnvValues.name,
          }),
      );
      throw new InternalServerErrorException(errorMessage);
    }
    return value;
  }
}
