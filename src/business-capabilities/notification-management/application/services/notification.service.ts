import { Injectable } from '@nestjs/common';
import { notification } from '@prisma/client';
import { ERROR, INFORMATION } from '../../../../shared/environment/event-id.constants';
import { LoggerFactory } from '../../../../shared/modules/logger/logger-factory';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { CreateNotificationDto, NotificationResponseDto } from '../../domain/dtos/notification.dto';

@Injectable()
export class NotificationService {
  context: string = NotificationService.name;
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
  ) {}

  /**
   * Crea una nueva notificación
   * @param createNotificationDto Datos de la notificación a crear
   * @returns La notificación creada
   */
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    try {
      // Generar un ID único para la notificación
      const lastNotification = await this.prismaService.notification.findFirst({
        orderBy: { notification_id: 'desc' },
      });
      
      const nextId = lastNotification ? lastNotification.notification_id + 1 : 1;

      const notification = await this.prismaService.notification.create({
        data: {
          notification_id: nextId,
          rut: createNotificationDto.rut,
          channel_id: createNotificationDto.channelId,
          message: createNotificationDto.message,
          creation_date: new Date(),
          status: createNotificationDto.status || 'pendiente',
        },
        include: {
          notification_channel: true,
        },
      });

      this.log.Information({
        message: 'Notification created successfully',
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.mapToResponseDto(notification);
    } catch (error) {
      this.log.Error({
        message: 'Error creating notification',
        eventId: ERROR.USER_SERVICES,
        context: this.context,
        payload: error.message,
      });
      throw error;
    }
  }

  /**
   * Busca notificaciones por RUT del cliente
   * @param rut RUT del cliente
   * @returns Lista de notificaciones
   */
  async findNotificationsByRut(rut: string): Promise<NotificationResponseDto[]> {
    try {
      const notifications = await this.prismaService.notification.findMany({
        where: { rut },
        include: {
          notification_channel: true,
        },
        orderBy: { creation_date: 'desc' },
      });

      return notifications.map(notification => this.mapToResponseDto(notification));
    } catch (error) {
      this.log.Error({
        message: 'Error finding notifications by RUT',
        eventId: ERROR.USER_SERVICES,
        context: this.context,
        payload: error.message,
      });
      throw error;
    }
  }

  /**
   * Mapea un objeto notification de Prisma a NotificationResponseDto
   * @param notification Objeto notification de Prisma con relaciones
   * @returns NotificationResponseDto
   */
  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      notificationId: notification.notification_id,
      rut: notification.rut,
      channelId: notification.channel_id,
      message: notification.message,
      creationDate: notification.creation_date,
      sendingDate: notification.sending_date || undefined,
      status: notification.status,
      channel: notification.notification_channel ? {
        channelId: notification.notification_channel.channel_id,
        name: notification.notification_channel.name,
      } : undefined,
    };
  }
}