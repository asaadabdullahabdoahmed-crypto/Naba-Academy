import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../identity/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { AcademicCatalogController } from './academic-catalog.controller';

describe('AcademicCatalogController authorization contract', () => {
  it('requires a valid session and one of the canonical catalog-read roles', () => {
    expect(
      Reflect.getMetadata('__guards__', AcademicCatalogController),
    ).toEqual([SessionAuthGuard, RolesGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, AcademicCatalogController)).toEqual([
      'system_admin',
      'department_head',
      'instructor',
      'student',
    ]);
  });
});
