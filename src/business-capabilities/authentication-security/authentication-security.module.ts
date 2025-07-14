import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/services/auth.service';
import { TokenBlacklistService } from './application/services/token-blacklist.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { JwtBlacklistGuard } from './infrastructure/guards/jwt-blacklist.guard';
import { LocalAuthGuard } from './infrastructure/guards/local-auth.guard';
import { PrismaModule } from '../../modules/prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';
import { UserManagementModule } from '../user-management/user-management.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    SharedModule,
    UserManagementModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenBlacklistService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    JwtBlacklistGuard,
    LocalAuthGuard,
  ],
  exports: [
    AuthService,
    TokenBlacklistService,
    JwtAuthGuard,
    JwtBlacklistGuard,
    LocalAuthGuard,
    JwtStrategy,
    LocalStrategy,
  ],
})
export class AuthenticationSecurityModule {}