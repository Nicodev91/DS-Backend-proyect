import { AxiosRequestConfig } from 'axios';

export default class HttpClientRequestDto {
  url: string;

  conf?: AxiosRequestConfig;

  body?: string;
}

export enum Method {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
  Patch = 'patch',
}
