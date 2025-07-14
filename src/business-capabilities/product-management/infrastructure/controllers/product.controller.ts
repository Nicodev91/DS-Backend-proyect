import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../authentication-security/infrastructure/guards/jwt-auth.guard';
import { JwtBlacklistGuard } from '../../../authentication-security/infrastructure/guards/jwt-blacklist.guard';
import { CategoryService } from '../../application/services/category.service';
import { ProductService } from '../../application/services/product.service';
import { CategoryResponseDto, CategoryCatalogDto } from '../../domain/dtos/category.dto';
import {
  CreateProductDto,
  ProductListResponseDto,
  ProductQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from '../../domain/dtos/product.dto';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtBlacklistGuard, JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Product list retrieved successfully',
    type: ProductListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name', example: 'Laptop' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', example: 1 })
  @ApiQuery({ name: 'supplier', required: false, description: 'Filter by supplier', example: 'RUT123' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', example: true })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productService.findAllProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    return this.productService.findProductById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product deleted successfully' },
        id: { type: 'number', example: 1 },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; id: number }> {
    return this.productService.deleteProduct(id);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Products by category retrieved successfully',
    type: [ProductResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findProductsByCategory(categoryId);
  }

  @Get('supplier/:rut')
  @ApiOperation({ summary: 'Get products by supplier' })
  @ApiParam({ name: 'rut', description: 'Supplier RUT', example: 'RUT123' })
  @ApiResponse({
    status: 200,
    description: 'Products by supplier retrieved successfully',
    type: [ProductResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async findBySupplier(
    @Param('rut') rut: string,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findProductsBySupplier(rut);
  }
}

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get('products')
  @ApiOperation({ summary: 'Get available products catalog (public)' })
  @ApiResponse({
    status: 200,
    description: 'Available products catalog retrieved successfully',
    type: ProductListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name', example: 'Laptop' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', example: 1 })
  async getAvailableProducts(@Query() query: ProductQueryDto) {
    const catalogQuery = { ...query, status: true };
    return this.productService.findAllProducts(catalogQuery);
  }

  @Get('products/category/:categoryId')
  @ApiOperation({ summary: 'Get available products by category (public)' })
  @ApiParam({ name: 'categoryId', description: 'Category ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Available products by category retrieved successfully',
    type: [ProductResponseDto],
  })
  async getAvailableProductsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ): Promise<ProductResponseDto[]> {
    return this.productService.findProductsByCategory(categoryId);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get available product details (public)' })
  @ApiParam({ name: 'id', description: 'Product ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Product details retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async getProductDetails(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    return this.productService.findProductById(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all available categories (public)' })
  @ApiResponse({
    status: 200,
    description: 'Category list retrieved successfully',
    type: [CategoryCatalogDto],
  })
  async getAvailableCategories(): Promise<CategoryCatalogDto[]> {
    return this.categoryService.findAllCategoriesForCatalog();
  }
}