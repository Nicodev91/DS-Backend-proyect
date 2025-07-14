import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user: {
    id: number;
    email: string;
    createdAt: Date;
    name: string;
    phone: string;
    rut: string;
    address: string;
  };
}
export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    ctx: ExecutionContext,
  ): { id: number; email: string; createdAt: Date; name: string; phone: string; rut: string; address: string } => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
