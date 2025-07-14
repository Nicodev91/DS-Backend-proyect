import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsInt, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName?: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del usuario',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El RUT no puede exceder 20 caracteres' })
  rut?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La contraseña no puede exceder 255 caracteres' })
  password?: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Número de teléfono del usuario',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El número de teléfono no puede exceder 20 caracteres' })
  phoneNumber?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del tipo de usuario',
  })
  @IsOptional()
  @IsInt({ message: 'El tipo de usuario debe ser un número entero' })
  @Type(() => Number)
  userTypeId?: number;

  @ApiProperty({
    example: true,
    description: 'Estado activo del usuario',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;

  @ApiProperty({
    example: false,
    description: 'Estado de verificación del usuario',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado de verificación debe ser un valor booleano' })
  isVerified?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'Juan Carlos',
    description: 'Nombre del usuario',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    example: 'Pérez González',
    description: 'Apellido del usuario',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  last_name?: string;

  @ApiProperty({
    example: 'user.updated@example.com',
    description: 'Email del usuario',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Nueva contraseña del usuario (mínimo 6 caracteres)',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La contraseña no puede exceder 255 caracteres' })
  password?: string;

  @ApiProperty({
    example: '+56987654321',
    description: 'Número de teléfono del usuario',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El número de teléfono no puede exceder 20 caracteres' })
  phone_number?: string;

  @ApiProperty({
    example: 2,
    description: 'ID del tipo de usuario',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El tipo de usuario debe ser un número entero' })
  @Type(() => Number)
  user_type_id?: number;

  @ApiProperty({
    example: false,
    description: 'Estado activo del usuario',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  is_active?: boolean;

  @ApiProperty({
    example: true,
    description: 'Estado de verificación del usuario',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado de verificación debe ser un valor booleano' })
  is_verified?: boolean;
}

export class UserResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  user_id: number;

  @ApiProperty({ description: 'Nombre del usuario' })
  name?: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  last_name?: string;

  @ApiProperty({ description: 'RUT del usuario' })
  rut?: string;

  @ApiProperty({ description: 'Email del usuario' })
  email?: string;

  @ApiProperty({ description: 'Número de teléfono del usuario' })
  phone_number?: string;

  @ApiProperty({ description: 'ID del tipo de usuario' })
  user_type_id?: number;

  @ApiProperty({ description: 'Estado activo del usuario' })
  is_active?: boolean;

  @ApiProperty({ description: 'Estado de verificación del usuario' })
  is_verified?: boolean;

  @ApiProperty({ description: 'Último login del usuario' })
  lastLogin?: Date;

  @ApiProperty({ description: 'Fecha de registro del usuario' })
  registerDate?: Date;

  @ApiProperty({ description: 'Fecha de creación del usuario' })
  createdAt?: Date;

  @ApiProperty({ description: 'Fecha de última actualización del usuario' })
  updatedAt?: Date;
}