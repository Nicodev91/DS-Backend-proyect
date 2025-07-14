import { Module } from '@nestjs/common';
import { ProductService } from './application/services/product.service';
import { CategoryService } from './application/services/category.service';
import { SupplierService } from './application/services/supplier.service';
import { ProductController, CatalogController } from './infrastructure/controllers/product.controller';
import { CategoryController } from './infrastructure/controllers/category.controller';
import { SupplierController } from './infrastructure/controllers/supplier.controller';
import { PrismaModule } from '../../modules/prisma/prisma.module';
import { SharedModule } from '../../shared/shared.module';
import { AuthenticationSecurityModule } from '../authentication-security/authentication-security.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    AuthenticationSecurityModule,
  ],
  controllers: [
    ProductController,
    CatalogController,
    CategoryController,
    SupplierController,
  ],
  providers: [
    ProductService,
    CategoryService,
    SupplierService,
  ],
  exports: [
    ProductService,
    CategoryService,
    SupplierService,
  ],
})
export class ProductManagementModule {}