import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty({
    description: 'RUT único del proveedor',
    example: '12345678-9',
  })
  @IsString({ message: 'El RUT del proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT del proveedor es requerido' })
  rut: string;

  @ApiProperty({
    example: 'Distribuidora Tech S.A.',
    description: 'Nombre del proveedor',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Av. Principal 123, Ciudad',
    description: 'Dirección del proveedor',
    maxLength: 100,
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MaxLength(100, { message: 'La dirección no puede exceder 100 caracteres' })
  address: string;
}

export class UpdateSupplierDto {
  @ApiProperty({
    example: 'Distribuidora Tech S.A. - Actualizada',
    description: 'Nombre del proveedor',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    example: 'Av. Principal 456, Ciudad Nueva',
    description: 'Dirección del proveedor',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La dirección no puede exceder 100 caracteres' })
  address?: string;
}

export class SupplierResponseDto {
  @ApiProperty({ description: 'RUT del proveedor' })
  rut: string;

  @ApiProperty({ description: 'Nombre del proveedor' })
  name: string;

  @ApiProperty({ description: 'Dirección del proveedor' })
  address: string;

  @ApiProperty({ description: 'Lista de productos del proveedor', required: false })
  products?: {
    // El campo SKU ha sido eliminado porque no existe en la base de datos
    nombre: string;
    precio: number;
    stock: number;
    estado: string;
  }[];
}