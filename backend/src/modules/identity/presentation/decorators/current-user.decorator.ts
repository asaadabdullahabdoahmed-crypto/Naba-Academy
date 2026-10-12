import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof UserEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserEntity | undefined;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
