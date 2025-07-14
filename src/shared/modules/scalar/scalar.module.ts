import { Global, Module } from '@nestjs/common';
import { ScalarClient } from '@shared/modules/scalar/scalar-client';

@Global()
@Module({
  providers: [ScalarClient],
  exports: [ScalarClient],
})
export class ScalarModule {}
