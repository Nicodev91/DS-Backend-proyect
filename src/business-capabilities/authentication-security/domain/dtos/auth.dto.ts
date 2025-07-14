import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'The email must have a valid format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString({ message: 'The password must be a string' })
  @MinLength(6, { message: 'The password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'User full name',
  })
  @IsString({ message: 'The name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'User RUT',
  })
  @IsString({ message: 'The RUT must be a string' })
  @IsNotEmpty({ message: 'RUT is required' })
  rut: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'The email must have a valid format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
  })
  @IsString({ message: 'The password must be a string' })
  @MinLength(6, { message: 'The password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'User phone number',
  })
  @IsString({ message: 'The phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({
    example: 'Calle Principal 123, Santiago',
    description: 'User address',
  })
  @IsString({ message: 'The address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'Token type' })
  tokenType: string;

  @ApiProperty({ description: 'Expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: {
    id: number;
    email: string | null;
    createdAt: Date | null;
  };
}