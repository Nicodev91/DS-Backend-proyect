import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosResponse, isAxiosError, Method } from 'axios';
import HttpClientRequestDto from './http.client.dto';
import { catchError, firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpClient } from './http.client.interface';

@Injectable()
export class AxiosClient implements HttpClient {
  constructor(private readonly httpService: HttpService) {}

  async executeHttpMethod(
    method: Method,
    httpClientRequestDto: HttpClientRequestDto,
  ): Promise<AxiosResponse> {
    return firstValueFrom(
      this.httpService
        .request({
          method: method,
          url: httpClientRequestDto.url,
          data: httpClientRequestDto.body ?? undefined,
          headers: httpClientRequestDto.conf?.headers,
          responseType: httpClientRequestDto.conf?.responseType ?? undefined,
        })
        .pipe(
          map((axiosValue) => {
            return axiosValue;
          }),
          catchError((error) => {
            if (isAxiosError(error)) {
              if (error.response?.status) {
                throw new HttpException(
                  {
                    code: error.response.status,
                    message: error.response.statusText,
                  },
                  error.response.status,
                );
              }
            }
            throw new InternalServerErrorException();
          }),
        ),
    );
  }
}
