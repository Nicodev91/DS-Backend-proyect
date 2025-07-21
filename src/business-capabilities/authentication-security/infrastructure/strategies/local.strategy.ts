import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../../../user-management/application/services/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<{ id: number; email: string | null; createdAt: Date | null }> {
    try {
      const user = await this.userService.validateUser(email,password);

      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      return {
        id: user.user_id,
        email: user.email,
        createdAt: user.register_date,
      };
    } catch {
      throw new UnauthorizedException('Error en la autenticación');
    }
  }
}
