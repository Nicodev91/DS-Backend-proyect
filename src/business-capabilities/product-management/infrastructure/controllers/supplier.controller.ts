import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SupplierService } from '../../application/services/supplier.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierResponseDto,
} from '../../domain/dtos/supplier.dto';
import { JwtAuthGuard } from '../../../authentication-security/infrastructure/guards/jwt-auth.guard';
import { JwtBlacklistGuard } from '../../../authentication-security/infrastructure/guards/jwt-blacklist.guard';

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtBlacklistGuard, JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
    type: SupplierResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'A supplier with this RUT already exists' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async create(@Body() createSupplierDto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.supplierService.createSupplier(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers retrieved successfully',
    type: [SupplierResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async findAll(): Promise<SupplierResponseDto[]> {
    return this.supplierService.findAllSuppliers();
  }

  @Get(':rut')
  @ApiOperation({ summary: 'Get supplier by RUT' })
  @ApiParam({ name: 'rut', description: 'Supplier RUT', example: 'RUT123' })
  @ApiResponse({
    status: 200,
    description: 'Supplier retrieved successfully',
    type: SupplierResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async findOne(@Param('rut') rut: string): Promise<SupplierResponseDto> {
    return this.supplierService.findSupplierByRut(rut);
  }

  @Patch(':rut')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiParam({ name: 'rut', description: 'Supplier RUT', example: 'RUT123' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
    type: SupplierResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async update(
    @Param('rut') rut: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.supplierService.updateSupplier(rut, updateSupplierDto);
  }

  @Delete(':rut')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiParam({ name: 'rut', description: 'Supplier RUT', example: 'RUT123' })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Supplier deleted successfully' },
        rut: { type: 'string', example: 'RUT123' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiConflictResponse({ description: 'Cannot delete a supplier with associated products' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async remove(@Param('rut') rut: string): Promise<{ message: string; rut: string }> {
    return this.supplierService.deleteSupplier(rut);
  }
}