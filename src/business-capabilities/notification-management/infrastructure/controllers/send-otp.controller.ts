import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { OtpService } from '../../application/services/otp.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  OtpResponseDto,
  VerifyOtpResponseDto,
} from '../../domain/dtos/otp.dto';

@ApiTags('OTP')
@Controller('otp')
export class SendOtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP code by email' })
  @ApiResponse({
    status: 200,
    description: 'OTP code sent successfully',
    type: OtpResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<OtpResponseDto> {
    return this.otpService.sendOtp(sendOtpDto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({
    status: 200,
    description: 'OTP code verified',
    type: VerifyOtpResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<VerifyOtpResponseDto> {
    return this.otpService.verifyOtp(verifyOtpDto);
  }
}
