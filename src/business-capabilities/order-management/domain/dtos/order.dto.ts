import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class CreateOrderDetailDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto',
  })
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @Type(() => Number)
  productId: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad del producto',
  })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del cliente',
  })
  @IsString({ message: 'El RUT del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT del cliente es requerido' })
  rut: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Fecha de la orden',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener un formato válido' })
  orderDate?: string;

  @ApiProperty({
    example: 'Calle Principal 123, Santiago',
    description: 'Dirección de envío',
  })
  @IsString({ message: 'La dirección de envío debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección de envío es requerida' })
  shippingAddress: string;

  @ApiProperty({
    type: [CreateOrderDetailDto],
    description: 'Detalles de la orden',
  })
  @IsArray({ message: 'Los detalles deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  @IsNotEmpty({ message: 'Los detalles de la orden son requeridos' })
  orderDetails: CreateOrderDetailDto[];
}

export class OrderDetailResponseDto {
  @ApiProperty({ description: 'ID del detalle de la orden' })
  orderDetailId: number;

  @ApiProperty({ description: 'ID de la orden' })
  orderId: number;

  @ApiProperty({ description: 'ID del producto' })
  productId: number;

  @ApiProperty({ description: 'Cantidad' })
  quantity: number;

  @ApiProperty({ description: 'Precio unitario' })
  unitPrice: number;

  @ApiProperty({ description: 'Subtotal' })
  subtotal: number;

  @ApiProperty({ description: 'Información del producto', required: false })
  product?: {
    productId: number;
    name: string;
    imageUrl: string;
    price: number;
  };
}

export class OrderResponseDto {
  @ApiProperty({ description: 'ID de la orden' })
  orderId: number;

  @ApiProperty({ description: 'RUT del cliente' })
  rut: string;

  @ApiProperty({ description: 'Fecha de la orden' })
  orderDate: Date;

  @ApiProperty({ description: 'Monto total' })
  totalAmount: number;

  @ApiProperty({ description: 'Estado de la orden' })
  status: string;

  @ApiProperty({ description: 'Dirección de envío' })
  shippingAddress: string;

  @ApiProperty({ description: 'ID del usuario' })
  userId: number;

  @ApiProperty({ description: 'Información del cliente', required: false })
  customer?: {
    rut: string;
    name: string;
    email: string;
  };

  @ApiProperty({ description: 'Detalles de la orden', type: [OrderDetailResponseDto] })
  orderDetails?: OrderDetailResponseDto[];
}

export class OrderQueryDto {
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
    description: 'Límite de órdenes por página',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    example: '12345678-9',
    description: 'Filtrar por RUT del cliente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  rut?: string;

  @ApiProperty({
    example: 'pendiente',
    description: 'Filtrar por estado de la orden',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  status?: string;
}