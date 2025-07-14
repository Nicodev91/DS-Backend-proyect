import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, MaxLength, IsEmail } from 'class-validator';
import { CreateOrderDetailDto, OrderDetailResponseDto } from './order.dto';

export class CustomerDataDto {
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
    example: '944086220',
    description: 'Número de teléfono del cliente (alternativo)',
    maxLength: 20,
    required: false,
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
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  password: string = "prueba01";

  @ApiProperty({
    example: 'juan.perez@email.com',
    description: 'Email del cliente',
    maxLength: 100,
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
  email: string;

  @ApiProperty({
    example: 'Calle Principal 123, Santiago',
    description: 'Dirección del cliente',
    maxLength: 255,
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  address: string;
}

export class NotificationDataDto {
  @ApiProperty({
    example: 1,
    description: 'ID del canal de notificación',
  })
  @IsInt({ message: 'El ID del canal debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del canal es requerido' })
  @Type(() => Number)
  channelId: number;

  @ApiProperty({
    example: 'Su orden ha sido creada exitosamente',
    description: 'Mensaje de la notificación',
    maxLength: 150,
  })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  @MaxLength(150, { message: 'El mensaje no puede exceder 150 caracteres' })
  message: string;

  @ApiProperty({
    example: 'pendiente',
    description: 'Estado de la notificación',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El estado no puede exceder 50 caracteres' })
  status?: string;
}

export class CreateCompleteOrderDto {
  @ApiProperty({
    type: CustomerDataDto,
    description: 'Datos del cliente',
  })
  @ValidateNested()
  @Type(() => CustomerDataDto)
  @IsNotEmpty({ message: 'Los datos del cliente son requeridos' })
  customer: CustomerDataDto;

  @ApiProperty({
    type: NotificationDataDto,
    description: 'Datos de la notificación',
  })
  @ValidateNested()
  @Type(() => NotificationDataDto)
  @IsNotEmpty({ message: 'Los datos de la notificación son requeridos' })
  notification: NotificationDataDto;

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

export class CompleteOrderResponseDto {
  @ApiProperty({ 
    example: 'ORD-001',
    description: 'Order number' 
  })
  orderNumber: string;

  @ApiProperty({ 
    example: 'Pending',
    description: 'Order status' 
  })
  status: string;

  @ApiProperty({ 
    example: 'marioandresesche',
    description: 'Customer name' 
  })
  customer: string;

  @ApiProperty({ 
    example: 'prueba',
    description: 'Shipping address' 
  })
  shippingAddress: string;

  @ApiProperty({ 
    example: '13 de julio de 2025, 11:57 p. m.',
    description: 'Order date' 
  })
  orderDate: string;

  @ApiProperty({ 
    example: '$5.500 CLP',
    description: 'Total amount' 
  })
  total: string;
}