import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { supplier, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { LoggerFactory } from '@shared/modules/logger/logger-factory';
import { ERROR, INFORMATION } from '@shared/environment/event-id.constants';
import { CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto } from '../../domain/dtos/supplier.dto';

@Injectable()
export class SupplierService {
  context: string = SupplierService.name;
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
  ) {}

  /**
   * Transforma un proveedor de la base de datos a DTO de respuesta
   */
  private transformToResponseDto(supplier: any): SupplierResponseDto {
    return {
      rut: supplier.rut,
      name: supplier.name,
      address: supplier.address,
      products: supplier.product?.map((product: any) => ({
        productId: product.product_id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        status: product.status,
      })) || [],
    };
  }

  /**
   * Crea un nuevo proveedor
   * @param createProveedorDto Datos para crear el proveedor
   * @returns El proveedor creado
   */
  async createSupplier(createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    try {
      // Verificar que el proveedor no existe
      const existingSupplier = await this.prismaService.supplier.findUnique({
        where: { rut: createSupplierDto.rut },
      });
      
      if (existingSupplier) {
        this.log.Error({
          message: 'Ya existe un proveedor con este RUT',
          payload: `RUT: ${createSupplierDto.rut}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new ConflictException('Ya existe un proveedor con este RUT');
      }

      const supplier = await this.prismaService.supplier.create({
        data: {
          rut: createSupplierDto.rut,
          name: createSupplierDto.name,
          address: createSupplierDto.address,
        },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              stock: true,
              status: true,
            },
            orderBy: {
              product_id: 'desc',
            },
          },
        },
      });

      this.log.Information({
        message: 'Proveedor creado exitosamente',
        payload: `RUT: ${supplier.rut}, Nombre: ${supplier.name}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(supplier);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al crear proveedor',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene todos los proveedores
   * @returns Lista de proveedores
   */
  async findAllSuppliers(): Promise<SupplierResponseDto[]> {
    try {
      const suppliers = await this.prismaService.supplier.findMany({
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              stock: true,
              status: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      this.log.Information({
        message: 'Proveedores obtenidos exitosamente',
        payload: `Total: ${suppliers.length}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return suppliers.map(p => this.transformToResponseDto(p));
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener proveedores',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene un proveedor por ID
   * @param id ID del proveedor
   * @returns El proveedor con productos
   */
  async findSupplierByRut(rut: string): Promise<SupplierResponseDto> {
    try {
      const supplier = await this.prismaService.supplier.findUnique({
        where: { rut: rut },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              stock: true,
              status: true,
            },
          },
        },
      });

      if (!supplier) {
        this.log.Error({
          message: 'Proveedor no encontrado',
          payload: `RUT: ${rut}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new NotFoundException('Proveedor no encontrado');
      }

      this.log.Information({
        message: 'Proveedor obtenido exitosamente',
        payload: `RUT: ${supplier.rut}, Nombre: ${supplier.name}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(supplier);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al obtener proveedor',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Actualiza un proveedor
   * @param rut RUT del proveedor
   * @param updateSupplierDto Datos para actualizar
   * @returns El proveedor actualizado
   */
  async updateSupplier(
    rut: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    try {
      // Verificar que el proveedor existe
      const existingSupplier = await this.findSupplierByRut(rut);

      const supplier = await this.prismaService.supplier.update({
        where: { rut: rut },
        data: {
          ...(updateSupplierDto.name && { name: updateSupplierDto.name }),
          ...(updateSupplierDto.address && { address: updateSupplierDto.address }),
        },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              stock: true,
              status: true,
            },
            orderBy: {
              product_id: 'desc',
            },
          },
        },
      });

      this.log.Information({
        message: 'Proveedor actualizado exitosamente',
        payload: `RUT: ${supplier.rut}, Nombre: ${supplier.name}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(supplier);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al actualizar proveedor',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Elimina un proveedor
   * @param rut RUT del proveedor a eliminar
   * @returns Mensaje de confirmación
   */
  async deleteSupplier(rut: string): Promise<{ message: string; rut: string }> {
    try {
      // Verificar que el proveedor existe
      const supplier = await this.findSupplierByRut(rut);

      // Verificar que no tenga productos asociados
      if (supplier.products && supplier.products.length > 0) {
        this.log.Error({
          message: 'No se puede eliminar proveedor con productos asociados',
          payload: `RUT: ${rut}, Productos: ${supplier.products.length}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new ConflictException('No se puede eliminar un proveedor que tiene productos asociados');
      }

      await this.prismaService.supplier.delete({
        where: { rut: rut },
      });

      this.log.Information({
        message: 'Proveedor eliminado exitosamente',
        payload: `RUT: ${rut}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        message: 'Proveedor eliminado exitosamente',
        rut,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al eliminar proveedor',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }
}