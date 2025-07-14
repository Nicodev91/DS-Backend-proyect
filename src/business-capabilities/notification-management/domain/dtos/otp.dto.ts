import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email address where the OTP code will be sent',
  })
  @IsEmail({}, { message: 'The email must have a valid format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'The email must have a valid format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  @IsString({ message: 'The OTP code must be a string' })
  @Length(6, 6, { message: 'The OTP code must be exactly 6 digits' })
  @IsNotEmpty({ message: 'OTP code is required' })
  code: string;
}

export class OtpResponseDto {
  @ApiProperty({ description: 'Confirmation message' })
  message: string;

  @ApiProperty({ description: 'Email where the code was sent' })
  email: string;

  @ApiProperty({ description: 'Expiration time in minutes' })
  expiresIn: number;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ description: 'Confirmation message' })
  message: string;

  @ApiProperty({ description: 'Indicates if the code is valid' })
  isValid: boolean;
}