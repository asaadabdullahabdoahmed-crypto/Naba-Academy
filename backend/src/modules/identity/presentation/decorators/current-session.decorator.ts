import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSessionEntity } from '../../infrastructure/persistence/entities/user-session.entity';

export const CurrentSession = createParamDecorator(
  (data: keyof UserSessionEntity | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const session = request.session as UserSessionEntity | undefined;

    if (!session) {
      return null;
    }

    return data ? session[data] : session;
  },
);
