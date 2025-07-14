import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @ApiProperty({
    example: '12345678-9',
    description: 'RUT del cliente',
    maxLength: 20,
  })
  @IsString({ message: 'El RUT debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @MaxLength(20, { message: 'El RUT no puede exceder 20 caracteres' })
  rut: string;

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

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID de la notificación' })
  notificationId: number;

  @ApiProperty({ description: 'RUT del cliente' })
  rut: string;

  @ApiProperty({ description: 'ID del canal de notificación' })
  channelId: number;

  @ApiProperty({ description: 'Mensaje de la notificación' })
  message: string;

  @ApiProperty({ description: 'Fecha de creación' })
  creationDate: Date;

  @ApiProperty({ description: 'Fecha de envío', required: false })
  sendingDate?: Date;

  @ApiProperty({ description: 'Estado de la notificación' })
  status: string;

  @ApiProperty({ description: 'Información del canal', required: false })
  channel?: {
    channelId: number;
    name: string;
  };
}