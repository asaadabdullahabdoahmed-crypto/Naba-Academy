import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { CanonicalRoleCode, IdentityScopeType } from '../../identity/domain/identity.types';
import { PermissionEntity } from '../../identity/infrastructure/persistence/entities/permission.entity';
import { RolePermissionEntity } from '../../identity/infrastructure/persistence/entities/role-permission.entity';
import { UserRoleAssignmentEntity } from '../../identity/infrastructure/persistence/entities/user-role-assignment.entity';
import { UserEntity } from '../../identity/infrastructure/persistence/entities/user.entity';
import {
  AcademicProgramEntity,
  CourseOfferingEntity,
  DepartmentEntity,
} from '../infrastructure/persistence/academic-catalog.entity';

export type AcademicPrincipal = Pick<
  UserEntity,
  'id' | 'accountStatus' | 'emailVerifiedAt'
>;

export interface ScopedAcademicPermission {
  permissionCode: string;
  roleCodes: readonly CanonicalRoleCode[];
  scopeType: Exclude<IdentityScopeType, 'global'>;
  scopeId: string;
}

@Injectable()
export class AcademicAuthorizationService {
  constructor(
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly roleAssignments: Pick<
      Repository<UserRoleAssignmentEntity>,
      'find'
    >,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissions: Pick<Repository<RolePermissionEntity>, 'find'>,
    @InjectRepository(DepartmentEntity)
    private readonly departments: Pick<Repository<DepartmentEntity>, 'findOne'>,
    @InjectRepository(AcademicProgramEntity)
    private readonly programs: Pick<Repository<AcademicProgramEntity>, 'findOne'>,
    @InjectRepository(CourseOfferingEntity)
    private readonly courseOfferings: Pick<Repository<CourseOfferingEntity>, 'findOne'>,
  ) {}

  async assertStudentOwns(
    principal: AcademicPrincipal | null | undefined,
    resourceOwnerId: string | null | undefined,
  ): Promise<void> {
    this.assertActivePrincipal(principal);
    if (!resourceOwnerId || resourceOwnerId !== principal.id) {
      throw new ForbiddenException('Academic resource ownership is required');
    }

    const assignments = await this.activeAssignments(principal.id);
    const hasStudentSelfRole = assignments.some(
      (assignment) =>
        assignment.role?.code === 'student' &&
        assignment.scopeType === 'global' &&
        assignment.scopeId === null,
    );
    if (!hasStudentSelfRole) {
      throw new ForbiddenException('An active student role assignment is required');
    }
  }

  async assertScopedPermission(
    principal: AcademicPrincipal | null | undefined,
    requirement: ScopedAcademicPermission,
  ): Promise<void> {
    this.assertActivePrincipal(principal);
    if (
      !requirement.permissionCode ||
      requirement.roleCodes.length === 0 ||
      !requirement.scopeId
    ) {
      throw new ForbiddenException('A concrete academic permission and scope are required');
    }
    const assignments = await this.activeAssignments(principal.id);
    const allowedRoles = new Set<string>(requirement.roleCodes);
    const matchingAssignments = assignments.filter(
      (assignment) =>
        assignment.role &&
        allowedRoles.has(assignment.role.code) &&
        assignment.scopeType === requirement.scopeType &&
        assignment.scopeId === requirement.scopeId,
    );
    if (matchingAssignments.length !== 1) {
      throw new ForbiddenException('No unique active role assignment exists for this scope');
    }
    if (
      matchingAssignments[0].role?.code === 'instructor' &&
      requirement.scopeType === 'course_offering'
    ) {
      throw new ForbiddenException(
        'Teacher access requires a verified section assignment, which is not available',
      );
    }
    if (!(await this.isActiveScope(requirement.scopeType, requirement.scopeId))) {
      throw new ForbiddenException('The academic scope is missing or inactive');
    }

    const grants = await this.rolePermissions.find({
      where: { roleId: In([matchingAssignments[0].roleId]) },
      relations: ['permission'],
    });
    if (
      !grants.some(
        (grant) => grant.permission?.code === requirement.permissionCode,
      )
    ) {
      throw new ForbiddenException('The assigned role lacks the required permission');
    }
  }

  private assertActivePrincipal(
    principal: AcademicPrincipal | null | undefined,
  ): asserts principal is AcademicPrincipal {
    if (
      !principal ||
      !principal.id ||
      principal.accountStatus !== 'active' ||
      !principal.emailVerifiedAt
    ) {
      throw new ForbiddenException('An active authenticated identity is required');
    }
  }

  private activeAssignments(userId: string): Promise<UserRoleAssignmentEntity[]> {
    return this.roleAssignments.find({
      where: {
        userId,
        revokedAt: IsNull(),
        assignedAt: LessThanOrEqual(new Date()),
      },
      relations: ['role'],
    });
  }

  private async isActiveScope(
    scopeType: Exclude<IdentityScopeType, 'global'>,
    scopeId: string,
  ): Promise<boolean> {
    if (scopeType === 'department') {
      const department = await this.departments.findOne({
        where: { id: scopeId, status: 'active', deletedAt: IsNull() },
        relations: { college: { university: true } },
      });
      return Boolean(
        department &&
          department.college?.status === 'active' &&
          !department.college.deletedAt &&
          (department.college.universityId === null ||
            (department.college.university?.status === 'active' &&
              !department.college.university.deletedAt)),
      );
    }

    if (scopeType === 'program') {
      const program = await this.programs.findOne({
        where: { id: scopeId, status: 'active', deletedAt: IsNull() },
        relations: {
          department: { college: { university: true } },
          credentialLevel: true,
        },
      });
      const department = program?.department;
      const college = department?.college;
      return Boolean(
        program &&
          department?.status === 'active' &&
          !department.deletedAt &&
          college?.status === 'active' &&
          !college.deletedAt &&
          (college.universityId === null ||
            (college.university?.status === 'active' &&
              !college.university.deletedAt)) &&
          program.credentialLevel?.status === 'active' &&
          !program.credentialLevel.deletedAt,
      );
    }

    if (scopeType === 'course_offering') {
      const offering = await this.courseOfferings.findOne({
        where: {
          id: scopeId,
          status: In(['planned', 'open', 'closed']),
          deletedAt: IsNull(),
        },
        relations: {
          course: { department: { college: { university: true } } },
          term: true,
        },
      });
      const department = offering?.course?.department;
      const college = department?.college;
      return Boolean(
        offering &&
          offering.course.status === 'active' &&
          !offering.course.deletedAt &&
          department?.status === 'active' &&
          !department.deletedAt &&
          college?.status === 'active' &&
          !college.deletedAt &&
          (college.universityId === null ||
            (college.university?.status === 'active' &&
              !college.university.deletedAt)) &&
          offering.term?.status !== 'cancelled' &&
          !offering.term?.deletedAt,
      );
    }

    return false;
  }
}
