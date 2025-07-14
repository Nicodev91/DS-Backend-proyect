import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR, INFORMATION } from '../../../shared/environment/event-id.constants';
import { LoggerFactory } from '../../../shared/modules/logger/logger-factory';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CreateOrderDto, OrderQueryDto, OrderResponseDto } from '../domain/dtos/order.dto';
import { CreateCompleteOrderDto, CompleteOrderResponseDto } from '../domain/dtos/complete-order.dto';
import { CustomerService } from '../../user-management/application/services/customer.service';
import { UserService } from '../../user-management/application/services/user.service';
import { NotificationService } from '../../notification-management/application/services/notification.service';

@Injectable()
export class OrderService {
  context: string = OrderService.name;
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
    private readonly customerService: CustomerService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Transforma una orden de la base de datos a DTO de respuesta
   */
  private transformToResponseDto(order: any): OrderResponseDto {
    return {
      orderId: order.order_id,
      rut: order.rut,
      orderDate: order.order_date,
      totalAmount: order.total_amount,
      status: order.status,
      shippingAddress: order.shipping_address,
      userId: order.user_id,
      customer: order.customer ? {
        rut: order.customer.rut,
        name: order.customer.name,
        email: order.customer.email,
      } : undefined,
      orderDetails: order.order_detail ? order.order_detail.map(detail => ({
        orderDetailId: detail.order_detail_id,
        orderId: detail.order_id,
        productId: detail.product_id,
        quantity: detail.quantity,
        unitPrice: detail.unit_price,
        subtotal: detail.subtotal,
        product: detail.product ? {
          productId: detail.product.product_id,
          name: detail.product.name,
          imageUrl: detail.product.image_url,
          price: detail.product.price,
        } : undefined,
      })) : undefined,
    };
  }

  /**
   * Genera el siguiente ID de orden
   * @returns El siguiente ID disponible
   */
  private async generateNextOrderId(): Promise<number> {
    const lastOrder = await this.prismaService.orders.findFirst({
      orderBy: { order_id: 'desc' },
      select: { order_id: true },
    });
    
    return lastOrder ? lastOrder.order_id + 1 : 1;
  }

  /**
   * Genera el siguiente ID de detalle de orden
   * @returns El siguiente ID disponible
   */
  private async generateNextOrderDetailId(): Promise<number> {
    const lastOrderDetail = await this.prismaService.order_detail.findFirst({
      orderBy: { order_detail_id: 'desc' },
      select: { order_detail_id: true },
    });
    
    return lastOrderDetail ? lastOrderDetail.order_detail_id + 1 : 1;
  }

  /**
   * Crea una nueva orden con sus detalles
   * @param createOrderDto Datos para crear la orden
   * @returns La orden creada con sus detalles
   */
  async createOrder(createOrderDto: CreateOrderDto, userId: number | { id: number }): Promise<OrderResponseDto> {
    try {
      // Verificar que el cliente existe, si no existe lo creamos
      let customer = await this.prismaService.customer.findUnique({
        where: { rut: createOrderDto.rut },
      });
      
      if (!customer) {
        // Crear cliente básico si no existe
        customer = await this.prismaService.customer.create({
          data: {
            rut: createOrderDto.rut,
            name: 'Cliente Temporal', // Se puede actualizar después
          },
        });
      }
      
      //validar usuario administrador 

      const user = await this.prismaService.user.findFirst({
        where: { 
          user_type_id: 1, 
          user_id: typeof userId === 'object' ? userId.id : userId 
        }
      })
      if (!user) {
        this.log.Error({
          message: 'Cliente de tipo Administrador no encontrado',
          payload: `RUT: ${createOrderDto.rut}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new BadRequestException('El usuario especificado no existe');
      }

      // Verificar que todos los productos existen y tienen stock suficiente
      const productIds = createOrderDto.orderDetails.map(detail => detail.productId);
      const products = await this.prismaService.product.findMany({
        where: {
          product_id: { in: productIds },
        },
      });

      if (products.length !== productIds.length) {
        this.log.Error({
          message: 'Uno o más productos no existen',
          payload: JSON.stringify(productIds),
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new BadRequestException('Uno o más productos no existen');
      }

      // Verificar stock suficiente
      for (const detail of createOrderDto.orderDetails) {
        const product = products.find(p => p.product_id === detail.productId);
        if (!product) {
          throw new BadRequestException(`Producto con ID ${detail.productId} no encontrado`);
        }
        if (product.stock !== null && product.stock < detail.quantity) {
          this.log.Error({
            message: 'Stock insuficiente',
            payload: `Producto: ${product.name}, Stock: ${product.stock}, Solicitado: ${detail.quantity}`,
            eventId: ERROR.USER_SERVICES,
            context: this.context,
          });
          throw new BadRequestException(`Stock insuficiente para el producto ${product.name}`);
        }
      }

      // Calcular el monto total
      let totalAmount = 0;
      const orderDetails: {
        product_id: number;
        quantity: number;
        unit_price: number;
        subtotal: number;
      }[] = [];

      for (const detail of createOrderDto.orderDetails) {
        const product = products.find(p => p.product_id === detail.productId);
        if (!product) {
          throw new BadRequestException(`Producto con ID ${detail.productId} no encontrado`);
        }
        const subtotal = Number(product.price ?? 0) * detail.quantity;
        totalAmount += subtotal;

        orderDetails.push({
          product_id: detail.productId,
          quantity: detail.quantity,
          unit_price: Number(product.price ?? 0),
          subtotal: subtotal,
        });
      }

      // Crear la orden y sus detalles en una transacción
      const nextOrderId = await this.generateNextOrderId();

      return await this.prismaService.$transaction(async (prisma) => {
        // Crear la orden
        const order = await prisma.orders.create({
          data: {
            order_id: nextOrderId,
            rut: createOrderDto.rut,
            order_date: createOrderDto.orderDate ? new Date(createOrderDto.orderDate) : new Date(),
            total_amount: totalAmount,
            status: 'pendiente',
            shipping_address: createOrderDto.shippingAddress,
            user_id: typeof userId === 'object' ? userId.id : userId,
          },
          include: {
            customer: true,
          },
        });

        // Crear los detalles de la orden
        let nextOrderDetailId = await this.generateNextOrderDetailId();
        const createdOrderDetails: any[] = [];

        for (const detail of orderDetails) {
          const orderDetail = await prisma.order_detail.create({
            data: {
              order_detail_id: nextOrderDetailId++,
              order_id: order.order_id,
              product_id: detail.product_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              subtotal: detail.subtotal,
            },
            include: {
              product: true,
            },
          });

          createdOrderDetails.push(orderDetail);

          // Actualizar el stock del producto
          await prisma.product.update({
            where: { product_id: detail.product_id },
            data: {
              stock: {
                decrement: detail.quantity,
              },
            },
          });
        }

        this.log.Information({
          message: 'Orden creada exitosamente',
          payload: `ID: ${order.order_id}, Total: ${totalAmount}`,
          eventId: INFORMATION.USER_SERVICES,
          context: this.context,
        });

        return this.transformToResponseDto({
          ...order,
          order_detail: createdOrderDetails,
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al crear orden',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      throw this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene todas las órdenes con paginación y filtros
   * @param query Parámetros de consulta
   * @returns Lista paginada de órdenes
   */
  async findAllOrders(query: OrderQueryDto) {
    try {
      const { page = 1, limit = 10, rut, status } = query;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: Prisma.ordersWhereInput = {};
      
      if (rut) {
        where.rut = rut;
      }
      
      if (status) {
        where.status = status;
      }

      const [orders, total] = await Promise.all([
        this.prismaService.orders.findMany({
          where,
          include: {
            customer: true,
            order_detail: {
              include: {
                product: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            order_id: 'desc',
          },
        }),
        this.prismaService.orders.count({ where }),
      ]);

      this.log.Information({
        message: 'Órdenes obtenidas exitosamente',
        payload: `Total: ${total}, Página: ${page}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        orders: orders.map(o => this.transformToResponseDto(o)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener órdenes',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      throw this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene una orden por ID
   * @param id ID de la orden
   * @returns La orden con sus detalles
   */
  async findOrderById(id: number): Promise<OrderResponseDto> {
    try {
      const order = await this.prismaService.orders.findUnique({
        where: { order_id: id },
        include: {
          customer: true,
          order_detail: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        this.log.Error({
          message: 'Orden no encontrada',
          payload: `ID: ${id}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new NotFoundException('Orden no encontrada');
      }

      this.log.Information({
        message: 'Orden obtenida exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(order);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al obtener orden',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      throw this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Actualiza el estado de una orden
   * @param id ID de la orden
   * @param status Nuevo estado
   * @returns La orden actualizada
   */
  async updateOrderStatus(id: number, status: string): Promise<OrderResponseDto> {
    try {
      // Verificar que la orden existe
      await this.findOrderById(id);

      const order = await this.prismaService.orders.update({
        where: { order_id: id },
        data: { status },
        include: {
          customer: true,
          order_detail: {
            include: {
              product: true,
            },
          },
        },
      });

      this.log.Information({
        message: 'Estado de orden actualizado exitosamente',
        payload: `ID: ${id}, Estado: ${status}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(order);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al actualizar estado de orden',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      throw this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Crea un cliente (si no existe), una notificación y una orden completa
   * @param createCompleteOrderDto Datos completos para crear cliente, notificación y orden
   * @param userId ID del usuario que crea la orden
   * @returns Respuesta completa con cliente, notificación y orden creados
   */
  async createCompleteOrder(
    createCompleteOrderDto: CreateCompleteOrderDto,
    userId: number
  ): Promise<CompleteOrderResponseDto> {
    try {
      // 1. Crear o encontrar el cliente
      const customer = await this.customerService.findOrCreateCustomer({
        rut: createCompleteOrderDto.customer.rut,
        name: createCompleteOrderDto.customer.name,
        phone: createCompleteOrderDto.customer.phone,
        phoneNumber: createCompleteOrderDto.customer.phoneNumber,
        email: createCompleteOrderDto.customer.email,
        address: createCompleteOrderDto.customer.address,
      });

      // 1.1. Crear el usuario con password
      try {
        await this.userService.createUserWithPassword({
          email: createCompleteOrderDto.customer.email,
          rut: createCompleteOrderDto.customer.rut,
          name: createCompleteOrderDto.customer.name,
          phone: createCompleteOrderDto.customer.phoneNumber || createCompleteOrderDto.customer.phone,
          password: createCompleteOrderDto.customer.password,
          address: createCompleteOrderDto.customer.address,
        });
      } catch (error) {
        // Si el usuario ya existe, continuamos con el proceso
        this.log.Information({
          message: 'User already exists, continuing with order creation',
          payload: `Email: ${createCompleteOrderDto.customer.email}`,
          eventId: INFORMATION.USER_SERVICES,
          context: this.context,
        });
      }

      // 2. Crear la orden usando el método existente
      const orderDto: CreateOrderDto = {
        rut: createCompleteOrderDto.customer.rut,
        orderDate: createCompleteOrderDto.orderDate,
        shippingAddress: createCompleteOrderDto.shippingAddress,
        orderDetails: createCompleteOrderDto.orderDetails,
      };

      const order = await this.createOrder(orderDto, userId);

      // 3. Crear la notificación
      const notification = await this.notificationService.createNotification({
        rut: createCompleteOrderDto.customer.rut,
        channelId: createCompleteOrderDto.notification.channelId,
        message: createCompleteOrderDto.notification.message,
        status: createCompleteOrderDto.notification.status,
      });

      this.log.Information({
        message: 'Orden completa creada exitosamente',
        payload: `Cliente: ${customer.rut}, Orden: ${order.orderId}, Notificación: ${notification.notificationId}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      // Formatear la fecha en español
      const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(order.orderDate);

      // Formatear el total en pesos chilenos
      const totalFormateado = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(order.totalAmount);

      return {
        orderNumber: `ORD-${order.orderId.toString().padStart(3, '0')}`,
        status: order.status,
        customer: customer.name || customer.rut,
        shippingAddress: order.shippingAddress,
        orderDate: fechaFormateada,
        total: totalFormateado,
      };
    } catch (error) {
      this.log.Error({
        message: 'Error al crear orden completa',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      throw error;
    }
  }
}