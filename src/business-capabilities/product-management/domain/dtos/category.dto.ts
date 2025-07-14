import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Electrónicos',
    maxLength: 500,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(500, { message: 'El nombre no puede exceder 500 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descripción de la categoría',
    example: 'Productos electrónicos y tecnológicos',
    maxLength: 100,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MaxLength(100, { message: 'La descripción no puede exceder 100 caracteres' })
  description: string;
}

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Electrónicos y Tecnología',
    description: 'Nombre de la categoría',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(500, { message: 'El nombre no puede exceder 500 caracteres' })
  name?: string;

  @ApiProperty({
    example: 'Productos electrónicos, tecnológicos y gadgets',
    description: 'Descripción de la categoría',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(100, { message: 'La descripción no puede exceder 100 caracteres' })
  description?: string;
}

export class CategoryResponseDto {
  @ApiProperty({ description: 'ID de la categoría' })
  categoryId: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  name: string;

  @ApiProperty({ description: 'Descripción de la categoría' })
  description: string;

  @ApiProperty({ description: 'Lista de productos de la categoría', required: false })
  products?: {
    // El campo SKU ha sido eliminado porque no existe en la base de datos
    nombre: string;
    precio: number;
    stock: number;
    estado: string;
  }[];
}

export class CategoryCatalogDto {
  @ApiProperty({ description: 'ID de la categoría' })
  categoryId: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  name: string;

  @ApiProperty({ description: 'Descripción de la categoría' })
  description: string;
}