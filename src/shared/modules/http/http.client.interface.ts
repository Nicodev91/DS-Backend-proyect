import { AxiosResponse } from 'axios';
import HttpClientRequestDto, { Method } from './http.client.dto';

export interface HttpClient {
  executeHttpMethod(
    method: Method,
    httpClientRequestDto: HttpClientRequestDto,
  ): Promise<AxiosResponse>;
}
