import { SetMetadata } from '@nestjs/common';
import { CanonicalRoleCode } from '../../domain/identity.types';

export const ROLES_KEY = 'identity:required-roles';

export const Roles = (...roles: CanonicalRoleCode[]) =>
  SetMetadata(ROLES_KEY, roles);
