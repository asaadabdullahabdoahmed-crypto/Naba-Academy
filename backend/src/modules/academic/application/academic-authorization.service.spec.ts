import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../identity/infrastructure/persistence/entities/permission.entity';
import { RolePermissionEntity } from '../../identity/infrastructure/persistence/entities/role-permission.entity';
import { UserRoleAssignmentEntity } from '../../identity/infrastructure/persistence/entities/user-role-assignment.entity';
import { UserEntity } from '../../identity/infrastructure/persistence/entities/user.entity';
import {
  AcademicProgramEntity,
  CourseOfferingEntity,
  DepartmentEntity,
} from '../infrastructure/persistence/academic-catalog.entity';
import { AcademicAuthorizationService } from './academic-authorization.service';

describe('AcademicAuthorizationService', () => {
  const principal = {
    id: 'user-1',
    accountStatus: 'active',
    emailVerifiedAt: new Date('2026-01-01T00:00:00Z'),
  } as UserEntity;
  const roleAssignments = {
    find: jest.fn(),
  } as unknown as jest.Mocked<Pick<Repository<UserRoleAssignmentEntity>, 'find'>>;
  const rolePermissions = {
    find: jest.fn(),
  } as unknown as jest.Mocked<Pick<Repository<RolePermissionEntity>, 'find'>>;
  const departments = {
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Pick<Repository<DepartmentEntity>, 'findOne'>>;
  const programs = {
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Pick<Repository<AcademicProgramEntity>, 'findOne'>>;
  const courseOfferings = {
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Pick<Repository<CourseOfferingEntity>, 'findOne'>>;
  const authorization = new AcademicAuthorizationService(
    roleAssignments,
    rolePermissions,
    departments,
    programs,
    courseOfferings,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    roleAssignments.find.mockReset();
    rolePermissions.find.mockReset();
    departments.findOne.mockReset();
    programs.findOne.mockReset();
    courseOfferings.findOne.mockReset();
  });

  it('denies anonymous and inactive principals before checking assignments', async () => {
    await expect(
      authorization.assertScopedPermission(null, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['system_admin'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      authorization.assertStudentOwns(
        { ...principal, accountStatus: 'disabled' },
        principal.id,
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(roleAssignments.find).not.toHaveBeenCalled();
  });

  it('denies self-access without an active global student assignment', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        role: { code: 'student' },
        scopeType: 'global',
        scopeId: null,
      } as UserRoleAssignmentEntity,
    ]);
    departments.findOne.mockResolvedValue({
      status: 'active',
      deletedAt: null,
      college: {
        status: 'active',
        deletedAt: null,
        universityId: null,
      },
    } as DepartmentEntity);

    await expect(
      authorization.assertStudentOwns(principal, 'another-student'),
    ).rejects.toThrow(ForbiddenException);

    roleAssignments.find.mockResolvedValue([]);
    await expect(
      authorization.assertStudentOwns(principal, principal.id),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows only the authenticated student to access their own record', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        role: { code: 'student' },
        scopeType: 'global',
        scopeId: null,
      } as UserRoleAssignmentEntity,
    ]);
    departments.findOne.mockResolvedValue({
      status: 'active',
      deletedAt: null,
      college: {
        status: 'active',
        deletedAt: null,
        universityId: null,
      },
    } as DepartmentEntity);

    await expect(
      authorization.assertStudentOwns(principal, principal.id),
    ).resolves.toBeUndefined();
    expect(roleAssignments.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: principal.id }),
        relations: ['role'],
      }),
    );
  });

  it('denies missing role assignments and does not grant global scope implicitly', async () => {
    roleAssignments.find.mockResolvedValue([]);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['system_admin'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).rejects.toThrow(ForbiddenException);

    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'global-admin-role',
        role: { code: 'system_admin' },
        scopeType: 'global',
        scopeId: null,
      } as UserRoleAssignmentEntity,
    ]);
    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['system_admin'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(rolePermissions.find).not.toHaveBeenCalled();
  });

  it('denies cross-department assignments and queries only non-revoked, already-assigned roles', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'role-1',
        role: { code: 'department_head' },
        scopeType: 'department',
        scopeId: 'department-2',
      } as UserRoleAssignmentEntity,
    ]);
    departments.findOne.mockResolvedValue(null);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['system_admin', 'department_head'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(roleAssignments.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          revokedAt: expect.anything(),
          assignedAt: expect.anything(),
        }),
      }),
    );
    expect(rolePermissions.find).not.toHaveBeenCalled();
  });

  it('denies an assigned scope that is missing or inactive', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'department-head-role',
        role: { code: 'department_head' },
        scopeType: 'department',
        scopeId: 'department-1',
      } as UserRoleAssignmentEntity,
    ]);
    departments.findOne.mockResolvedValue(null);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['department_head'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(rolePermissions.find).not.toHaveBeenCalled();
  });

  it('denies access to a different course-offering scope', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'teacher-role',
        role: { code: 'instructor' },
        scopeType: 'course_offering',
        scopeId: 'offering-1',
      } as UserRoleAssignmentEntity,
    ]);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.section.read',
        roleCodes: ['instructor'],
        scopeType: 'course_offering',
        scopeId: 'offering-2',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(rolePermissions.find).not.toHaveBeenCalled();
  });

  it('denies teachers even with a course-offering assignment until section assignments exist', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'teacher-role',
        role: { code: 'instructor' },
        scopeType: 'course_offering',
        scopeId: 'offering-1',
      } as UserRoleAssignmentEntity,
    ]);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.section.read',
        roleCodes: ['instructor'],
        scopeType: 'course_offering',
        scopeId: 'offering-1',
      }),
    ).rejects.toThrow(/verified section assignment/);
    expect(roleAssignments.find).toHaveBeenCalledTimes(1);
    expect(rolePermissions.find).not.toHaveBeenCalled();
  });

  it('denies missing permissions and allows a matching explicitly scoped grant', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'department-head-role',
        role: { code: 'department_head' },
        scopeType: 'department',
        scopeId: 'department-1',
      } as UserRoleAssignmentEntity,
    ]);
    departments.findOne.mockResolvedValue({
      status: 'active',
      deletedAt: null,
      college: {
        status: 'active',
        deletedAt: null,
        universityId: null,
      },
    } as DepartmentEntity);
    rolePermissions.find.mockResolvedValue([
      {
        permission: { code: 'academic.department.read' },
      } as RolePermissionEntity,
    ]);

    const requirement = {
      permissionCode: 'academic.department.manage',
      roleCodes: ['department_head'] as const,
      scopeType: 'department' as const,
      scopeId: 'department-1',
    };
    await expect(
      authorization.assertScopedPermission(principal, requirement),
    ).rejects.toThrow(ForbiddenException);

    rolePermissions.find.mockResolvedValue([
      {
        permission: { code: 'academic.department.manage' } as PermissionEntity,
      } as RolePermissionEntity,
    ]);
    await expect(
      authorization.assertScopedPermission(principal, requirement),
    ).resolves.toBeUndefined();
  });

  it('allows an administrator only when assigned the exact department scope', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'system-admin-role',
        role: { code: 'system_admin' },
        scopeType: 'department',
        scopeId: 'department-1',
      } as UserRoleAssignmentEntity,
    ]);
    departments.findOne.mockResolvedValue({
      status: 'active',
      deletedAt: null,
      college: {
        status: 'active',
        deletedAt: null,
        universityId: null,
      },
    } as DepartmentEntity);
    rolePermissions.find.mockResolvedValue([
      {
        permission: { code: 'academic.department.manage' } as PermissionEntity,
      } as RolePermissionEntity,
    ]);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['system_admin'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).resolves.toBeUndefined();
    expect(roleAssignments.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: principal.id }),
      }),
    );
  });

  it('denies ambiguous duplicate assignments for the same scope', async () => {
    roleAssignments.find.mockResolvedValue([
      {
        roleId: 'role-a',
        role: { code: 'department_head' },
        scopeType: 'department',
        scopeId: 'department-1',
      } as UserRoleAssignmentEntity,
      {
        roleId: 'role-b',
        role: { code: 'system_admin' },
        scopeType: 'department',
        scopeId: 'department-1',
      } as UserRoleAssignmentEntity,
    ]);

    await expect(
      authorization.assertScopedPermission(principal, {
        permissionCode: 'academic.department.manage',
        roleCodes: ['system_admin', 'department_head'],
        scopeType: 'department',
        scopeId: 'department-1',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(rolePermissions.find).not.toHaveBeenCalled();
  });
});
