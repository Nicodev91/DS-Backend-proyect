import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ERROR, INFORMATION } from '@shared/environment/event-id.constants';
import { LoggerFactory } from '@shared/modules/logger/logger-factory';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { CreateProductDto, ProductQueryDto, UpdateProductDto, ProductResponseDto } from '../../domain/dtos/product.dto';
import { Prisma, product } from '@prisma/client';

@Injectable()
export class ProductService {
  context: string = ProductService.name;
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
  ) {}

  /**
   * Transforma un producto de la base de datos a DTO de respuesta
   */
  private transformToResponseDto(product: any): ProductResponseDto {
    return {
      productId: product.product_id,
      name: product.name,
      rutSupplier: product.rut_supplier,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.category_id,
      imageUrl: product.image_url,
      status: product.status,
      supplier: product.supplier ? {
        rut: product.supplier.rut,
        name: product.supplier.name,
        address: product.supplier.address,
      } : undefined,
      category: product.category ? {
        categoryId: product.category.category_id,
        name: product.category.name,
        description: product.category.description,
      } : undefined,
    };
  }

  /**
   * Genera el siguiente ID de producto
   * @returns El siguiente ID disponible
   */
  private async generateNextProductId(): Promise<number> {
    const lastProduct = await this.prismaService.product.findFirst({
      orderBy: { product_id: 'desc' },
      select: { product_id: true },
    });
    
    return lastProduct ? lastProduct.product_id + 1 : 1;
  }

  /**
   * Crea un nuevo producto
   * @param createProductoDto Datos para crear el producto
   * @returns El producto creado con relaciones
   */
  async createProduct(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      // Verificar que el producto no esté duplicado por nombre
      const existingProduct = await this.prismaService.product.findFirst({
        where: { name: createProductDto.name },
      });
      
      if (existingProduct) {
        this.log.Error({
          message: 'Producto duplicado',
          payload: `Nombre: ${createProductDto.name}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new BadRequestException('Ya existe un producto con este nombre');
      }

      // Verificar que el proveedor existe
      const supplier = await this.prismaService.supplier.findUnique({
        where: { rut: createProductDto.rutSupplier },
      });
      
      if (!supplier) {
        this.log.Error({
          message: 'Proveedor no encontrado',
          payload: `RUT: ${createProductDto.rutSupplier}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new BadRequestException('El proveedor especificado no existe');
      }

      // Verificar que la categoría existe
      const category = await this.prismaService.category.findUnique({
        where: { category_id: createProductDto.categoryId },
      });
      
      if (!category) {
        this.log.Error({
          message: 'Categoría no encontrada',
          payload: `ID: ${createProductDto.categoryId}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new BadRequestException('La categoría especificada no existe');
      }

      const nextProductId = await this.generateNextProductId();

      const product = await this.prismaService.product.create({
        data: {
          product_id: nextProductId,
          name: createProductDto.name,
          price: createProductDto.price,
          stock: createProductDto.stock,
          description: createProductDto.description,
          image_url: createProductDto.imageUrl,
          status: createProductDto.status,
          rut_supplier: createProductDto.rutSupplier,
          category_id: createProductDto.categoryId,
        },
        include: {
          supplier: true,
          category: true,
        },
      });

      this.log.Information({
        message: 'Producto creado exitosamente',
        payload: `ID: ${product.product_id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(product);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al crear producto',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene todos los productos con paginación y filtros
   * @param query Parámetros de consulta
   * @returns Lista paginada de productos
   */
  async findAllProducts(query: ProductQueryDto) {
    try {
      const { page = 1, limit = 10, search, category, supplier, status } = query;
      const skip = (page - 1) * limit;

      // Construir filtros
      const where: Prisma.productWhereInput = {};
      
      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }
      
      if (category !== undefined) {
        where.category_id = category;
      }
      
      if (supplier !== undefined) {
        where.rut_supplier = supplier;
      }
      
      if (status !== undefined) {
        where.status = status;
      }

      const [products, total] = await Promise.all([
        this.prismaService.product.findMany({
          where,
          include: {
            supplier: true,
            category: true,
          },
          skip,
          take: limit,
          orderBy: {
            product_id: 'desc',
          },
        }),
        this.prismaService.product.count({ where }),
      ]);

      this.log.Information({
        message: 'Productos obtenidos exitosamente',
        payload: `Total: ${total}, Página: ${page}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        products: products.map(p => this.transformToResponseDto(p)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener productos',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene un producto por ID
   * @param id ID del producto
   * @returns El producto con relaciones
   */
  async findProductById(id: number): Promise<ProductResponseDto> {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { product_id: id },
        include: {
          supplier: true,
          category: true,
        },
      });

      if (!product) {
        this.log.Error({
          message: 'Producto no encontrado',
          payload: `ID: ${id}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new NotFoundException('Producto no encontrado');
      }

      this.log.Information({
        message: 'Producto obtenido exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al obtener producto',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Actualiza un producto
   * @param id ID del producto a actualizar
   * @param updateProductDto Datos para actualizar
   * @returns El producto actualizado
   */
  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      // Verificar que el producto existe
      await this.findProductById(id);

      // Si se está actualizando el proveedor, verificar que existe
      if (updateProductDto.rutSupplier) {
        const supplier = await this.prismaService.supplier.findUnique({
          where: { rut: updateProductDto.rutSupplier },
        });
        
        if (!supplier) {
          throw new BadRequestException('El proveedor especificado no existe');
        }
      }

      // Si se está actualizando la categoría, verificar que existe
      if (updateProductDto.categoryId) {
        const category = await this.prismaService.category.findUnique({
          where: { category_id: updateProductDto.categoryId },
        });
        
        if (!category) {
          throw new BadRequestException('La categoría especificada no existe');
        }
      }

      const updateData: any = {};
      // El campo SKU ha sido eliminado porque no existe en la base de datos
      if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
      if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
      // Si se proporciona un nuevo valor de stock, primero obtenemos el stock actual
      if (updateProductDto.stock !== undefined) {
        // Obtenemos el producto actual para conocer su stock
        const currentProduct = await this.prismaService.product.findUnique({
          where: { product_id: id },
          select: { stock: true }
        });
        
        // Si no existe el producto, usamos directamente el valor proporcionado
        // Si existe, sumamos el stock actual con el nuevo valor
        if (!currentProduct) {
          updateData.stock = updateProductDto.stock;
        } else {
          // Aseguramos que la suma se realice correctamente con paréntesis
          updateData.stock = (currentProduct.stock || 0) + updateProductDto.stock;
          
          this.log.Information({
            message: 'Stock actualizado',
            payload: `ID: ${id}, Stock anterior: ${currentProduct.stock}, Nuevo stock: ${updateData.stock}`,
            eventId: INFORMATION.USER_SERVICES,
            context: this.context,
          });
        }
      }
      
      if (updateProductDto.description !== undefined) updateData.description = updateProductDto.description;
      if (updateProductDto.imageUrl !== undefined) updateData.image_url = updateProductDto.imageUrl;
      if (updateProductDto.status !== undefined) updateData.status = updateProductDto.status;
      if (updateProductDto.rutSupplier !== undefined) updateData.rut_supplier = updateProductDto.rutSupplier;
      if (updateProductDto.categoryId !== undefined) updateData.category_id = updateProductDto.categoryId;

      const product = await this.prismaService.product.update({
        where: { product_id: id },
        data: updateData,
        include: {
          supplier: true,
          category: true,
        },
      });

      this.log.Information({
        message: 'Producto actualizado exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(product);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al actualizar producto',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Elimina un producto
   * @param id ID del producto a eliminar
   * @returns Mensaje de confirmación
   */
  async deleteProduct(id: number): Promise<{ message: string; id: number }> {
    try {
      // Verificar que el producto existe
      await this.findProductById(id);

      await this.prismaService.product.delete({
        where: { product_id: id },
      });

      this.log.Information({
        message: 'Producto eliminado exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        message: 'Producto eliminado exitosamente',
        id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al eliminar producto',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene productos por categoría
   * @param categoryId ID de la categoría
   * @returns Lista de productos de la categoría
   */
  async findProductsByCategory(categoryId: number): Promise<ProductResponseDto[]> {
    try {
      const products = await this.prismaService.product.findMany({
        where: {
          category_id: categoryId,
          status: true,
        },
        include: {
          supplier: true,
          category: true,
        },
      });

      this.log.Information({
        message: 'Productos por categoría obtenidos exitosamente',
        payload: `Categoría: ${categoryId}, Total: ${products.length}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return products.map(p => this.transformToResponseDto(p));
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener productos por categoría',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene productos por proveedor
   * @param rut RUT del proveedor
   * @returns Lista de productos del proveedor
   */
  async findProductsBySupplier(rut: string): Promise<ProductResponseDto[]> {
    try {
      const products = await this.prismaService.product.findMany({
        where: {
          rut_supplier: rut,
          status: true,
        },
        include: {
          supplier: true,
          category: true,
        },
      });

      this.log.Information({
        message: 'Productos por proveedor obtenidos exitosamente',
        payload: `Proveedor: ${rut}, Total: ${products.length}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return products.map(p => this.transformToResponseDto(p));
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener productos por proveedor',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }
}