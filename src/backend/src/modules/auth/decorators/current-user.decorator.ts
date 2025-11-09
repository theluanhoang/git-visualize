import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.sub;
    
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    
    return userId;
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);

