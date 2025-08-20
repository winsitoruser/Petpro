import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const VendorId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.vendorId || request.user?.id;
  },
);