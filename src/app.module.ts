import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationSecurityModule } from './business-capabilities/authentication-security/authentication-security.module';
import { NotificationManagementModule } from './business-capabilities/notification-management/notification-management.module';
import { OrderManagementModule } from './business-capabilities/order-management/order-management.module';
import { ProductManagementModule } from './business-capabilities/product-management/product-management.module';
import { UserManagementModule } from './business-capabilities/user-management/user-management.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SharedModule,
    AuthenticationSecurityModule,
    UserManagementModule,
    ProductManagementModule,
    NotificationManagementModule,
    OrderManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
