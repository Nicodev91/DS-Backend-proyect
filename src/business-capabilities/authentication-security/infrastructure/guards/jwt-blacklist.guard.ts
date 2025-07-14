import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenBlacklistService } from '../../application/services/token-blacklist.service';

@Injectable()
export class JwtBlacklistGuard implements CanActivate {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.replace('Bearer ', '');
    if (this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token invalidado');
    }

    return true;
  }
}
