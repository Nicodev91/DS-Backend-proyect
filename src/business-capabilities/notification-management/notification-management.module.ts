import { Module } from '@nestjs/common';
import { OtpService } from './application/services/otp.service';
import { NotificationService } from './application/services/notification.service';
import { SendOtpController } from './infrastructure/controllers/send-otp.controller';
import { EmailModule } from './infrastructure/email/email.module';
import { PrismaModule } from '../../modules/prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    EmailModule,
    PrismaModule,
    SharedModule,
  ],
  controllers: [
    SendOtpController,
  ],
  providers: [
    OtpService,
    NotificationService,
  ],
  exports: [
    OtpService,
    NotificationService,
  ],
})
export class NotificationManagementModule {}