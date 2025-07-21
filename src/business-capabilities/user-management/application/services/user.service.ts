import { ConflictException, Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import { ERROR, INFORMATION } from '@shared/environment/event-id.constants';
import { LoggerFactory } from '@shared/modules/logger/logger-factory';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { hash, compare } from 'bcrypt';

@Injectable()
export class UserService {
  context: string = UserService.name;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly log: LoggerFactory,
  ) {}

  /**
   * Creates a user with password
   * @param data User creation data with password
   * @returns The created user
   * @throws ConflictException if the user already exists
   */
  async createUserWithPassword(data: { email: string; rut: string; name?: string; phone?: string; password: string; address?: string }): Promise<user> {
    try {
      const existingUser = await this.getUser(data.email);
      if (existingUser) {
        this.log.Error({
          message: 'User already exists',
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new ConflictException('A user already exists with this email');
      }
      const hashedPassword = await hash(data.password,10);
      // Generate the next user ID
      const nextUserId = await this.generateNextUserId();

      // Create the user with password
      return await this.prismaService.user.create({
        data: {
          user_id: nextUserId,
          name: data.name || data.email.split('@')[0],
          rut: data.rut,
          email: data.email,
          phone_number: data.phone || null,
          password: hashedPassword,
          register_date: new Date(),
          user_type_id: 1, // Default user type
          updated_at: new Date(),
          is_active: true,
          is_verified: false,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.log.Error({
        message: 'Error trying to create user with password',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      throw this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Inserts a new user into the database
   * @param data User creation data
   * @returns The created user
   * @throws ConflictException if the user already exists
   */
  async insertUser(data: { email: string; rut?: string; name?: string; phone?: string; address?: string }): Promise<user> {
    try {
      const existingUser = await this.getUser(data.email);
      if (existingUser) {
        this.log.Error({
          message: 'User already exists',
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        throw new ConflictException('A user already exists with this email');
      }

      // Generate a unique RUT if not provided
      const userRut = data.rut || this.generateUniqueRut();
      const userName = data.name || data.email.split('@')[0];

      // First, create the customer
      const customer = await this.prismaService.customer.create({
        data: {
          rut: userRut,
          name: userName,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null
        },
      });

      this.log.Information({
        message: 'Customer created successfully',
        payload: customer.rut,
        eventId: INFORMATION.USER_SERVICES,
        context: this.context,
      });

      // Generate the next user ID
      const nextUserId = await this.generateNextUserId();

      // Then, create the user with the customer's RUT
      return await this.prismaService.user.create({
        data: {
          user_id: nextUserId,
          name: userName,
          rut: customer.rut,
          email: data.email,
          phone_number: data.phone || null,
          register_date: new Date(),
          user_type_id: 1, // Default user type
          updated_at: new Date()
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.log.Error({
        message: 'Error trying to insert user',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Generates a unique RUT for the customer
   * @returns A unique RUT string
   */
  private generateUniqueRut(): string {
    // Generate a simple RUT format: XXXXXXXX-X
    const number = Math.floor(Math.random() * 99999999) + 10000000;
    const verifier = Math.floor(Math.random() * 10);
    return `${number}-${verifier}`;
  }

  /**
   * Generates the next user ID by finding the last user and adding 1
   * @returns The next user ID
   */
  private async generateNextUserId(): Promise<number> {
    try {
      const lastUser = await this.prismaService.user.findFirst({
        orderBy: {
          user_id: 'desc'
        }
      });
      
      return lastUser ? lastUser.user_id + 1 : 1;
    } catch (error) {
      this.log.Error({
        message: 'Error trying to generate next user ID',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      return 1; // Default to 1 if there's an error
    }
  }

  /**
   * Retrieves a user by email
   * @param email User's email
   * @returns The user if found, otherwise null
   */
  async getUser(email: string): Promise<user | null> {
    try {
      return await this.prismaService.user.findFirst({
        where: { email: email },
      });
    } catch (error) {
      this.log.Error({
        message: 'Error trying to get user',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Retrieves a user by email with customer information
   * @param email User's email
   * @returns The user with customer data if found, otherwise null
   */
  async getUserWithCustomer(email: string): Promise<any> {
    try {
      return await this.prismaService.user.findFirst({
        where: { email: email },
        include: {
          customer: {
            select: {
              address: true
            }
          }
        }
      });
    } catch (error) {
      this.log.Error({
        message: 'Error trying to get user with customer',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      this.prismaService.handleError(error as Error);
      return null;
    }
  }

  /**
   * Retrieves all users with a limit
   * @param limit Maximum number of users to retrieve (default 10)
   * @returns Array of users or null
   */
  async getAllUser(limit: number = 10): Promise<user[] | null> {
    try {
      return await this.prismaService.user.findMany({
        take: limit,
      });
    } catch (error) {
      this.log.Error({
        message: 'Error trying to get all users',
        payload: JSON.stringify(error),
        eventId: ERROR.USER_SERVICES,
        context: this.context,
      });
      this.prismaService.handleError(error as Error);
    }
  }

  /**
   * Validates a user by email
   * @param email User's email
   * @returns The user if found, otherwise null
   */
  async validateUser(email: string, password: string): Promise<user | null> {
    try {
      const user = await this.getUser(email);
      if (!user) {
        this.log.Error({
          message: 'User does not exist in the database',
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        return null;
      }
       const isPasswordValid = await compare(password, user.password as string);
       if(!isPasswordValid){
        this.log.Error({
          message: 'Incorrect password',
          eventId: ERROR.USER_SERVICES,
          context: this.context,
        });
        return null;
       }
      // Note: Password validation removed as the User model doesn't have a password field
      // This suggests authentication might be handled differently (e.g., via OTP)
      // For now, we'll just return the user if found
      return user;
    } catch (error) {
      this.prismaService.handleError(error as Error);
    }
  }
}