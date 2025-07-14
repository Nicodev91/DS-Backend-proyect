import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { user } from '@prisma/client';
import { UserService } from '../../../user-management/application/services/user.service';
import { CustomerService } from '../../../user-management/application/services/customer.service';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from '../../domain/dtos/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  context: string = AuthService.name;
  constructor(
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) { }

  /**
   * Registers a new user
   * @param registerDto Registration data
   * @returns Response with JWT token
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Crear customer primero (requerido por foreign key constraint)
      await this.customerService.findOrCreateCustomer({
        rut: registerDto.rut,
        name: registerDto.name,
        phone: registerDto.phoneNumber,
        email: registerDto.email,
        address: registerDto.address,
      });

      // Luego crear el usuario
      const newUser = await this.userService.createUserWithPassword({
        email: registerDto.email,
        rut: registerDto.rut,
        name: registerDto.name,
        phone: registerDto.phoneNumber,
        password: registerDto.password,
        address: registerDto.address,
      });

      const token = this.generateToken(newUser);
      return {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: newUser.user_id,
          email: newUser.email,
          createdAt: newUser.register_date,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Error in registration');
    }
  }

  /**
   * Authenticates an existing user
   * @param loginDto Login credentials
   * @returns Response with JWT token
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.userService.validateUser(
        loginDto.email,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const token = this.generateToken(user);
      return {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: user.user_id,
          email: user.email,
          createdAt: user.register_date,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Error in authentication');
    }
  }

  /**
   * Logs out the user by invalidating the token
   * @param token JWT token to invalidate
   * @param userId User ID
   * @returns Confirmation message
   */
  async logout(
    token: string,
    userId: number,
  ): Promise<{ message: string; userId: number }> {
    const cleanToken = token.replace('Bearer ', '');
    const payload = this.jwtService.verify(cleanToken);
    if (payload.sub !== userId) {
      throw new UnauthorizedException('Invalid token for this user');
    }
    this.tokenBlacklistService.addToBlacklist(cleanToken);
    return {
      message: 'Session closed successfully',
      userId: userId,
    };
  }

  /**
   * Generates a JWT token for the user
   * @param user User to generate the token for
   * @returns JWT token
   */
  private generateToken(user: user): string {
    const payload = {
      sub: user.user_id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
    };
    return this.jwtService.sign(payload);
  }

  /**
   * Validates a JWT token and returns the user
   * @param token JWT token
   * @returns User if the token is valid
   */
  async validateToken(token: string): Promise<user | null> {
    try {
      if (this.tokenBlacklistService.isBlacklisted(token)) {
        return null;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userService.getUser(payload.email);
      return user;
    } catch {
      return null;
    }
  }
}
