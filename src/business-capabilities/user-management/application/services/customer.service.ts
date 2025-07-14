import { Injectable, ConflictException } from '@nestjs/common';
import { customer } from '@prisma/client';
import { ERROR, INFORMATION } from '../../../../shared/environment/event-id.constants';
import { LoggerFactory } from '../../../../shared/modules/logger/logger-factory';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { CreateCustomerDto, CustomerResponseDto } from '../../domain/dtos/customer.dto';

@Injectable()
export class CustomerService {
  context: string = CustomerService.name;
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
  ) {}

  /**
   * Inserta un nuevo cliente en la base de datos
   * @param createCustomerDto Datos del cliente a crear
   * @returns El cliente creado
   * @throws ConflictException si el cliente ya existe
   */
  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const existingCustomer = await this.findCustomerByRut(createCustomerDto.rut);
      if (existingCustomer) {
        this.log.Error({
          message: 'Customer already exists',
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new ConflictException('Ya existe un cliente con este RUT');
      }

      const customer = await this.prismaService.customer.create({
        data: {
          rut: createCustomerDto.rut,
          name: createCustomerDto.name,
          phone: createCustomerDto.phone || createCustomerDto.phoneNumber,
          email: createCustomerDto.email,
          address: createCustomerDto.address,
        },
      });

      this.log.Information({
        message: 'Customer created successfully',
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.mapToResponseDto(customer);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.log.Error({
        message: 'Error creating customer',
        eventId: ERROR.USER_SERVICES,
        context: this.context,
        payload: error.message,
      });
      throw error;
    }
  }

  /**
   * Busca un cliente por RUT
   * @param rut RUT del cliente
   * @returns El cliente encontrado o null
   */
  async findCustomerByRut(rut: string): Promise<CustomerResponseDto | null> {
    try {
      const customer = await this.prismaService.customer.findUnique({
        where: { rut },
      });

      return customer ? this.mapToResponseDto(customer) : null;
    } catch (error) {
      this.log.Error({
        message: 'Error finding customer by RUT',
        eventId: ERROR.USER_SERVICES,
        context: this.context,
        payload: error.message,
      });
      throw error;
    }
  }

  /**
   * Crea un cliente si no existe, si existe lo retorna
   * @param createCustomerDto Datos del cliente
   * @returns El cliente existente o creado
   */
  async findOrCreateCustomer(createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    try {
      const existingCustomer = await this.findCustomerByRut(createCustomerDto.rut);
      
      if (existingCustomer) {
        this.log.Information({
          message: 'Customer already exists, returning existing customer',
          eventId: INFORMATION.USER_SERVICES,
          context: this.context,
        });
        return existingCustomer;
      }

      return await this.createCustomer(createCustomerDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        // Si hay un error de conflicto, intentamos buscar el cliente nuevamente
        const existingCustomer = await this.findCustomerByRut(createCustomerDto.rut);
        if (existingCustomer) {
          return existingCustomer;
        }
      }
      throw error;
    }
  }

  /**
   * Mapea un objeto customer de Prisma a CustomerResponseDto
   * @param customer Objeto customer de Prisma
   * @returns CustomerResponseDto
   */
  private mapToResponseDto(customer: customer): CustomerResponseDto {
    return {
      rut: customer.rut,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      email: customer.email || undefined,
      address: customer.address || undefined,
    };
  }
}