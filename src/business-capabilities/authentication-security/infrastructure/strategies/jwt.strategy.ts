import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../../user-management/application/services/user.service';
import { TokenBlacklistService } from '../../application/services/token-blacklist.service';
import { EnvValues } from '../../../../shared/environment/config/env-values.config';

interface JwtPayload {
  sub: number;
  email: string;
  iat: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: EnvValues.get().JWT_SECRET,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ id: number; email: string | null; createdAt: Date | null; name: string | null; phone: string | null; rut: string | null; address: string | null }> {
    try {
      // Obtener el token completo del request
      const token = this.getTokenFromRequest();

      // Verificar si el token está en la blacklist
      if (token && this.tokenBlacklistService.isBlacklisted(token)) {
        throw new UnauthorizedException('Token invalidado');
      }

      const user = await this.userService.getUserWithCustomer(payload.email);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Retornar la información completa del usuario
      return {
        id: user.user_id,
        email: user.email,
        createdAt: user.register_date,
        name: user.name,
        phone: user.phone_number,
        rut: user.rut,
        address: user.customer?.address || null,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private getTokenFromRequest(): string | null {
    // Esta función obtiene el token del request actual
    // En una implementación real, necesitarías acceder al request
    // Por ahora, retornamos null y la validación se hace en el AuthService
    return null;
  }
}
