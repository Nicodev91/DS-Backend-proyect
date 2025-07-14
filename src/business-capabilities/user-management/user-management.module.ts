import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { CustomerService } from './application/services/customer.service';
import { PrismaModule } from '../../modules/prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
  ],
  providers: [
    UserService,
    CustomerService,
  ],
  exports: [
    UserService,
    CustomerService,
  ],
})
export class UserManagementModule {}