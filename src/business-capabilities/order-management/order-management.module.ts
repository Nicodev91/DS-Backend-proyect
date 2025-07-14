import { Module } from '@nestjs/common';
import { PrismaModule } from '../../modules/prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';
import { AuthenticationSecurityModule } from '../authentication-security/authentication-security.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { NotificationManagementModule } from '../notification-management/notification-management.module';
import { OrderService } from './application/order.service';
import { OrderController } from './infrastructure/controllers/order.controller';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    AuthenticationSecurityModule,
    UserManagementModule,
    NotificationManagementModule,
  ],
  controllers: [
    OrderController,
  ],
  providers: [
    OrderService,
  ],
  exports: [
    OrderService,
  ],
})
export class OrderManagementModule {}