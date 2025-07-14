import { ApiProperty } from '@nestjs/swagger';

interface IGenericHttpExceptionDto {
  code: string;
  message: string;
}

export class GenericHttpExceptionDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '500' })
  code: string;
  @ApiProperty({ default: 'Internal Server Error' })
  message: string;
}
export class BadRequestHttpExceptionDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '400' })
  code: string;
  @ApiProperty({ default: 'Bad Request' })
  message: string;
}
export class UnathorizedHttpExceptionDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '401' })
  code: string;
  @ApiProperty({ default: 'Unathorized' })
  message: string;
}
export class TimeOutExceptionDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '504' })
  code: string;
  @ApiProperty({ default: 'Time Out exception' })
  message: string;
}
export class BadGatewayDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '502' })
  code: string;
  @ApiProperty({ default: 'Bad Gateway' })
  message: string;
}
export class ServiceUnavailableDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '503' })
  code: string;
  @ApiProperty({ default: 'Service Unavailable' })
  message: string;
}
export class NotFoundDto implements IGenericHttpExceptionDto {
  @ApiProperty({ default: '404' })
  code: string;
  @ApiProperty({ default: 'Not Found' })
  message: string;
}
