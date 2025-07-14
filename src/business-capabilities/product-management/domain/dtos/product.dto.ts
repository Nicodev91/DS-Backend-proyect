import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsNotEmpty, IsOptional, Min, MaxLength, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop Dell Inspiron 15',
    description: 'Nombre del producto',
    maxLength: 30,
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(30, { message: 'El nombre no puede exceder 30 caracteres' })
  name: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del proveedor',
  })
  @IsString({ message: 'El RUT del proveedor debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT del proveedor es requerido' })
  rutSupplier: string;

  @ApiProperty({
    example: 15000,
    description: 'Precio del producto',
  })
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Cantidad en stock',
  })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'El stock es requerido' })
  @Type(() => Number)
  stock: number;

  @ApiProperty({
    example: 'Laptop de alto rendimiento con procesador Intel Core i7',
    description: 'Descripción del producto',
    maxLength: 500,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría',
  })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la categoría es requerido' })
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({
    example: 'https://example.com/images/laptop.jpg',
    description: 'URL de la imagen del producto',
    maxLength: 1000,
  })
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @IsNotEmpty({ message: 'La URL de la imagen es requerida' })
  @MaxLength(1000, { message: 'La URL de la imagen no puede exceder 1000 caracteres' })
  imageUrl: string;

  @ApiProperty({
    example: true,
    description: 'Estado del producto (true = activo, false = inactivo)',
  })
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: boolean;
}

export class UpdateProductDto {
  // El campo SKU ha sido eliminado porque no existe en la base de datos

  @ApiProperty({
    example: 'Laptop Dell Inspiron 15 - Actualizada',
    description: 'Nombre del producto',
    maxLength: 30,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MaxLength(30, { message: 'El nombre no puede exceder 30 caracteres' })
  name?: string;

  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del proveedor',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El RUT del proveedor debe ser una cadena de texto' })
  rutSupplier?: string;

  @ApiProperty({
    example: 14000,
    description: 'Precio del producto',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    example: 45,
    description: 'Cantidad en stock',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
  @Type(() => Number)
  stock?: number;

  @ApiProperty({
    example: 'Laptop de alto rendimiento con procesador Intel Core i7 - Descripción actualizada',
    description: 'Descripción del producto',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @ApiProperty({
    example: 2,
    description: 'ID de la categoría',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({
    example: 'https://example.com/images/laptop-updated.jpg',
    description: 'URL de la imagen del producto',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  @MaxLength(1000, { message: 'La URL de la imagen no puede exceder 1000 caracteres' })
  imageUrl?: string;

  @ApiProperty({
    example: false,
    description: 'Estado del producto (true = activo, false = inactivo)',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  status?: boolean;
}

export class ProductResponseDto {
  @ApiProperty({ description: 'ID del producto' })
  productId: number;

  // El campo SKU ha sido eliminado porque no existe en la base de datos

  @ApiProperty({ description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ description: 'RUT del proveedor' })
  rutSupplier: string;

  @ApiProperty({ description: 'Precio del producto' })
  price: number;

  @ApiProperty({ description: 'Cantidad en stock' })
  stock: number;

  @ApiProperty({ description: 'Descripción del producto' })
  description: string;

  @ApiProperty({ description: 'ID de la categoría' })
  categoryId: number;

  @ApiProperty({ description: 'URL de la imagen del producto' })
  imageUrl: string;

  @ApiProperty({ description: 'Estado del producto' })
  status: boolean;

  @ApiProperty({ description: 'Información del proveedor', required: false })
  supplier?: {
    rut: string;
    name: string;
    address: string;
  };

  @ApiProperty({ description: 'Información de la categoría', required: false })
  category?: {
    categoryId: number;
    name: string;
    description: string;
  };
}

export class ProductListResponseDto {
  @ApiProperty({ description: 'Lista de productos', type: [ProductResponseDto] })
  products: ProductResponseDto[];

  @ApiProperty({ description: 'Total de productos' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Límite por página' })
  limit: number;
}

export class ProductQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Número de página',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Límite de productos por página',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    example: 'Laptop',
    description: 'Buscar por nombre del producto',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiProperty({
    description: 'Filtrar por ID de categoría',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  @Type(() => Number)
  category?: number;

  @ApiProperty({
    description: 'Filtrar por RUT de proveedor',
    example: '12345678-9',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El RUT de proveedor debe ser una cadena de texto' })
  supplier?: string;

  @ApiProperty({
    example: true,
    description: 'Filtrar por estado del producto (true = activo, false = inactivo)',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  status?: boolean;
}