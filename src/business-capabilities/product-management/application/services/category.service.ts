import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ERROR, INFORMATION } from '@shared/environment/event-id.constants';
import { LoggerFactory } from '@shared/modules/logger/logger-factory';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto, CategoryCatalogDto } from '../../domain/dtos/category.dto';

@Injectable()
export class CategoryService {
  context: string = CategoryService.name;
  
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
  ) {}

  /**
   * Transforma una categoría de la base de datos a DTO de respuesta
   */
  private transformToResponseDto(category: any): CategoryResponseDto {
    return {
      categoryId: category.category_id,
      name: category.name,
      description: category.description,
      products: category.product?.map((product: any) => ({
        productId: product.product_id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        status: product.status,
      })) || [],
    };
  }

  /**
   * Crea una nueva categoría
   * @param createCategoryDto Datos para crear la categoría
   * @returns La categoría creada
   */
  /**
   * Genera el siguiente ID de categoría
   * @returns El siguiente ID disponible
   */
  private async generateNextCategoryId(): Promise<number> {
    const lastCategory = await this.prismaService.category.findFirst({
      orderBy: { category_id: 'desc' },
      select: { category_id: true },
    });
    
    return lastCategory ? lastCategory.category_id + 1 : 1;
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      // Verificar que la categoría no existe
      const existingCategory = await this.prismaService.category.findFirst({
          where: { name: createCategoryDto.name },
        });
      
      if (existingCategory) {
          this.log.Error({
            message: 'Ya existe una categoría con este nombre',
            payload: `Nombre: ${createCategoryDto.name}`,
            eventId: ERROR.USER_SERVICES,
            context: this.context,
          });
          throw new ConflictException('Ya existe una categoría con este nombre');
        }

      const nextCategoryId = await this.generateNextCategoryId();

      const category = await this.prismaService.category.create({
          data: {
            category_id: nextCategoryId,
            name: createCategoryDto.name,
            description: createCategoryDto.description,
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
            },
          },
        });

      this.log.Information({
        message: 'Categoría creada exitosamente',
        payload: `ID: ${category.category_id}, Nombre: ${category.name}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(category);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al crear categoría',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene todas las categorías para catálogo (sin productos)
   * @returns Lista de categorías básicas
   */
  async findAllCategoriesForCatalog(): Promise<CategoryCatalogDto[]> {
    try {
      const categories = await this.prismaService.category.findMany({
        select: {
          category_id: true,
          name: true,
          description: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      this.log.Information({
        message: 'Categorías para catálogo obtenidas exitosamente',
        payload: `Total: ${categories.length}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return categories.map(category => ({
         categoryId: category.category_id,
         name: category.name || '',
         description: category.description || '',
       }));
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener categorías para catálogo',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene todas las categorías
   * @returns Lista de categorías
   */
  async findAllCategories(): Promise<CategoryResponseDto[]> {
    try {
      const categories = await this.prismaService.category.findMany({
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
        message: 'Categorías obtenidas exitosamente',
        payload: `Total: ${categories.length}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return categories.map(c => this.transformToResponseDto(c));
    } catch (error) {
      this.log.Error({
        message: 'Error al obtener categorías',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Obtiene una categoría por ID
   * @param id ID de la categoría
   * @returns La categoría con productos
   */
  async findCategoryById(id: number): Promise<CategoryResponseDto> {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { category_id: id },
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

      if (!category) {
        this.log.Error({
          message: 'Categoría no encontrada',
          payload: `ID: ${id}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new NotFoundException('Categoría no encontrada');
      }

      this.log.Information({
        message: 'Categoría obtenida exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al obtener categoría',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Actualiza una categoría
   * @param id ID de la categoría
   * @param updateCategoryDto Datos para actualizar
   * @returns La categoría actualizada
   */
  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    try {
      // Verificar que la categoría existe
      await this.findCategoryById(id);

      const updateData: any = {};
      if (updateCategoryDto.name) updateData.name = updateCategoryDto.name;
      if (updateCategoryDto.description) updateData.description = updateCategoryDto.description;

      const category = await this.prismaService.category.update({
        where: { category_id: id },
        data: updateData,
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
        message: 'Categoría actualizada exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return this.transformToResponseDto(category);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al actualizar categoría',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Elimina una categoría
   * @param id ID de la categoría a eliminar
   * @returns Mensaje de confirmación
   */
  async deleteCategory(id: number): Promise<{ message: string; id: number }> {
    try {
      // Verificar que la categoría existe
      const category = await this.findCategoryById(id);

      // Verificar que no tenga productos asociados
      if (category.products && category.products.length > 0) {
        this.log.Error({
          message: 'No se puede eliminar categoría con productos asociados',
          payload: `ID: ${id}, Productos: ${category.products.length}`,
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new ConflictException('No se puede eliminar una categoría que tiene productos asociados');
      }

      await this.prismaService.category.delete({
        where: { category_id: id },
      });

      this.log.Information({
        message: 'Categoría eliminada exitosamente',
        payload: `ID: ${id}`,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        message: 'Categoría eliminada exitosamente',
        id,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      this.log.Error({
        message: 'Error al eliminar categoría',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      
      this.prismaService.handleError(error as Error);
    }
  }
}