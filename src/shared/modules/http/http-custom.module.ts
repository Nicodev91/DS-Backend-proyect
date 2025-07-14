import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AxiosClient } from './axios.client';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AxiosClient],
  exports: [HttpModule, AxiosClient],
})
export class HttpCustomModule {}
