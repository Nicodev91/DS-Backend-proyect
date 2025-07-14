import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../authentication-security/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../authentication-security/infrastructure/decorators/current-user.decorator';
import { OrderService } from '../../application/order.service';
import { CreateOrderDto, OrderQueryDto, OrderResponseDto } from '../../domain/dtos/order.dto';
import { CreateCompleteOrderDto, CompleteOrderResponseDto } from '../../domain/dtos/complete-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('userId') userId: number,
  ): Promise<OrderResponseDto> {
    return this.orderService.createOrder(createOrderDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findAllOrders(@Query() query: OrderQueryDto) {
    return this.orderService.findAllOrders(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOrderById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderResponseDto> {
    return this.orderService.findOrderById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Status updated', type: OrderResponseDto })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Post('complete')
  @ApiOperation({ 
    summary: 'Create complete order with customer, notification and order details',
    description: 'Creates or finds a customer, creates a notification, and creates an order with details in a single operation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Complete order created successfully', 
    type: CompleteOrderResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 409, description: 'Conflict - insufficient stock or other business rule violation' })
  async createCompleteOrder(
    @Body() createCompleteOrderDto: CreateCompleteOrderDto,
  ): Promise<CompleteOrderResponseDto> {
    // Usar un userId por defecto (1) para órdenes sin autenticación
    return this.orderService.createCompleteOrder(createCompleteOrderDto, 1);
  }
}