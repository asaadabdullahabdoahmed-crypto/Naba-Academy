import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Request } from 'express';
import { CanonicalRoleCode } from '../../domain/identity.types';
import { UserRoleAssignmentEntity } from '../../infrastructure/persistence/entities/user-role-assignment.entity';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

type AuthenticatedRequest = Request & {
  user?: Pick<UserEntity, 'id'>;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly roleAssignmentRepository: Pick<
      Repository<UserRoleAssignmentEntity>,
      'find'
    >,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<
      readonly CanonicalRoleCode[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      throw new ForbiddenException('No roles are configured for this endpoint');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Authenticated user is required for role authorization');
    }

    const assignments = await this.roleAssignmentRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
      },
      relations: ['role'],
    });
    const allowedRoles = new Set<string>(requiredRoles);

    if (!assignments.some((assignment) => assignment.role && allowedRoles.has(assignment.role.code))) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
