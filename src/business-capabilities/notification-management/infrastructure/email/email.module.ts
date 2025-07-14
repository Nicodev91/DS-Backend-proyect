import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EnvValues } from '../../../../shared/environment/config/env-values.config';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: EnvValues.get().SMTP_HOST,
        port: EnvValues.get().SMTP_PORT,
        secure: EnvValues.get().SMTP_PORT === 465,
        ignoreTLS: true,
        auth: {
          user: EnvValues.get().SMTP_USER,
          pass: EnvValues.get().SMTP_PASS,
        }, 
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `"DataSentinel" <${EnvValues.get().SMTP_USER}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [MailerModule],
})
export class EmailModule {}
