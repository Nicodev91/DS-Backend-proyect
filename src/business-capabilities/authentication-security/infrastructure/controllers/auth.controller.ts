import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from '../../domain/dtos/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JwtBlacklistGuard } from '../guards/jwt-blacklist.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    createdAt: Date;
    name: string;
    phone: string;
    rut: string;
    address: string;
  };
}

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'A user already exists with this email',
  })
  @ApiConflictResponse({ description: 'Conflict: user already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtBlacklistGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({
    description: 'User profile',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  getProfile(@Request() req: RequestWithUser): {
    id: number;
    email: string;
    createdAt: Date;
    name: string;
    phone: string;
    rut: string;
    address: string;
  } {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtBlacklistGuard, JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiOperation({ summary: 'Logout (invalidate the token)' })
  @ApiResponse({
    status: 200,
    description: 'Session closed successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async logout(
    @Request() req: RequestWithUser,
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string; userId: number }> {
    return this.authService.logout(authHeader, req.user.id);
  }
}
