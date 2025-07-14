import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { LoggerFactory } from '@shared/modules/logger/logger-factory';
import { ERROR, INFORMATION } from '@shared/environment/event-id.constants';
import { MailerService } from '@nestjs-modules/mailer';
import {
  SendOtpDto,
  VerifyOtpDto,
  OtpResponseDto,
  VerifyOtpResponseDto,
} from '../../domain/dtos/otp.dto';

@Injectable()
export class OtpService {
  context: string = OtpService.name;
  private readonly OTP_EXPIRY_MINUTES = 10;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Generates a 6-digit OTP code
   * @returns 6-digit OTP code
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calculates the OTP expiration date
   * @returns Expiration date
   */
  private getExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + this.OTP_EXPIRY_MINUTES);
    return expiryDate;
  }

  /**
   * Sends an OTP code by email
   * @param sendOtpDto Data to send the OTP
   * @returns Response with sending information
   */
  async sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto> {
    try {
      const { email } = sendOtpDto;
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException('User not found with this email');
      }
      const otpCode = this.generateOtpCode();
      const expiryDate = this.getExpiryDate();
      await this.invalidatePreviousOtps(user.user_id);
      
      // Generate next OTP ID
      const lastOtp = await this.prismaService.otp.findFirst({
        orderBy: { otp_id: 'desc' },
      });
      const nextOtpId = lastOtp ? lastOtp.otp_id + 1 : 1;
      
      await this.prismaService.otp.create({
        data: {
          otp_id: nextOtpId,
          code: otpCode,
          expiration_date: expiryDate,
          user_id: user.user_id,
          status: 'active',
          creation_date: new Date(),
        },
      });
      await this.sendOtpEmail(email, otpCode);

      this.log.Information({
        message: 'OTP code sent successfully',
        payload: email,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        message: 'OTP code sent successfully',
        email,
        expiresIn: this.OTP_EXPIRY_MINUTES,
      };
    } catch (error) {
      this.log.Error({
        message: 'Error sending OTP code',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      throw error;
    }
  }
  /**
   * Verifies an OTP code
   * @param verifyOtpDto Data to verify the OTP
   * @returns Response with the verification result
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    try {
      const { email, code } = verifyOtpDto;
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) {
        return {
          message: 'User not found',
          isValid: false,
        };
      }
      const otp = await this.prismaService.otp.findFirst({
        where: {
          user_id: user.user_id,
          code,
          status: 'active',
          expiration_date: {
            gt: new Date(),
          },
        },
      });
      if (!otp) {
        return {
          message: 'Invalid or expired OTP code',
          isValid: false,
        };
      }
      await this.prismaService.otp.update({
        where: { otp_id: otp.otp_id },
        data: { status: 'used' },
      });

      this.log.Information({
        message: 'OTP code verified successfully',
        payload: email,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      return {
        message: 'OTP code verified successfully',
        isValid: true,
      };
    } catch (error) {
      this.log.Error({
        message: 'Error verifying OTP code',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      throw error;
    }
  }
  /**
   * Invalidates previous OTPs for a specific user
   * @param userId User ID
   */
  private async invalidatePreviousOtps(userId: number): Promise<void> {
    await this.prismaService.otp.updateMany({
      where: {
        user_id: userId,
        status: 'active',
      },
      data: {
        status: 'expired',
      },
    });
  }
  /**
   * Sends the email with the OTP code
   * @param email Recipient's email
   * @param otpCode OTP code to send
   */
  private async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'OTP Verification Code',
        template: 'otp-email',
        context: {
          otpCode,
          expiryMinutes: this.OTP_EXPIRY_MINUTES,
        },
      });
    } catch (error) {
      this.log.Error({
        message: 'Error sending email with OTP',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      throw new Error('Error sending email with OTP code');
    }
  }
}