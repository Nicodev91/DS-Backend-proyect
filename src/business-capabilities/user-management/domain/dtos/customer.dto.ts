import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: '12345678-9',
    description: 'RUT único del cliente',
    maxLength: 20,
  })
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @MaxLength(20, { message: 'El RUT no puede exceder 20 caracteres' })
  rut: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del cliente',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Número de teléfono del cliente',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone?: string;

  @ApiProperty({
    example: '944086220',
    description: 'Número de teléfono del cliente (alternativo)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El número de teléfono no puede exceder 20 caracteres' })
  phoneNumber?: string;

  @ApiProperty({
    example: 'prueba123',
    description: 'Contraseña del cliente',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  password?: string;

  @ApiProperty({
    example: 'cliente@example.com',
    description: 'Email del cliente',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'Av. Principal 123, Depto 4B',
    description: 'Dirección del cliente',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @ApiProperty({
    example: 'Santiago',
    description: 'Ciudad del cliente',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city?: string;

  @ApiProperty({
    example: 'Metropolitana',
    description: 'Región del cliente',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La región debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La región no puede exceder 100 caracteres' })
  region?: string;

  @ApiProperty({
    example: '7500000',
    description: 'Código postal del cliente',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El código postal no puede exceder 20 caracteres' })
  postalCode?: string;

  @ApiProperty({
    example: true,
    description: 'Estado activo del cliente',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;
}

export class UpdateCustomerDto {
  @ApiProperty({
    example: 'Juan Carlos Pérez',
    description: 'Nombre del cliente',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    example: '+56987654321',
    description: 'Número de teléfono del cliente',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone?: string;

  @ApiProperty({
    example: 'cliente.actualizado@example.com',
    description: 'Email del cliente',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email?: string;

  @ApiProperty({
    example: 'Av. Libertador 456, Casa 12',
    description: 'Dirección del cliente',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address?: string;

  @ApiProperty({
    example: 'Valparaíso',
    description: 'Ciudad del cliente',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  city?: string;

  @ApiProperty({
    example: 'Región de Valparaíso',
    description: 'Región del cliente',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La región debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La región no puede exceder 100 caracteres' })
  region?: string;

  @ApiProperty({
    example: '2340000',
    description: 'Código postal del cliente',
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  @MaxLength(10, { message: 'El código postal no puede exceder 10 caracteres' })
  postalCode?: string;

  @ApiProperty({
    example: false,
    description: 'Estado activo del cliente',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;
}

export class CustomerResponseDto {
  @ApiProperty({ description: 'RUT del cliente' })
  rut: string;

  @ApiProperty({ description: 'Nombre del cliente' })
  name?: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  phone?: string;

  @ApiProperty({ description: 'Email del cliente' })
  email?: string;

  @ApiProperty({ description: 'Dirección del cliente' })
  address?: string;

  @ApiProperty({ description: 'Ciudad del cliente' })
  city?: string;

  @ApiProperty({ description: 'Región del cliente' })
  region?: string;

  @ApiProperty({ description: 'Código postal del cliente' })
  postalCode?: string;

  @ApiProperty({ description: 'Estado activo del cliente' })
  isActive?: boolean;

  @ApiProperty({ description: 'Fecha de creación del cliente' })
  createdAt?: Date;

  @ApiProperty({ description: 'Fecha de última actualización del cliente' })
  updatedAt?: Date;
}