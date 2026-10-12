import {
  ACCOUNT_STATUSES,
  CANONICAL_ROLE_CODES,
  CANONICAL_ROLES,
  IDENTITY_SCOPE_TYPES,
} from './domain/identity.types';
import { IDENTITY_ENTITIES, IdentityModule } from './identity.module';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from './infrastructure/persistence/entities/permission.entity';
import { RolePermissionEntity } from './infrastructure/persistence/entities/role-permission.entity';
import { UserRoleAssignmentEntity } from './infrastructure/persistence/entities/user-role-assignment.entity';
import { UserSessionEntity } from './infrastructure/persistence/entities/user-session.entity';
import { EmailVerificationTokenEntity } from './infrastructure/persistence/entities/email-verification-token.entity';
import { PasswordResetTokenEntity } from './infrastructure/persistence/entities/password-reset-token.entity';
import { UserAccountStatusEventEntity } from './infrastructure/persistence/entities/user-account-status-event.entity';
import { CreateIdentityFoundation1726920000000 } from '../../database/migrations/1726920000000-CreateIdentityFoundation';

describe('Identity Module & Persistence Architecture', () => {
  describe('Canonical Domain Definitions', () => {
    it('defines exactly the 4 approved canonical roles without alumni or super_admin', () => {
      expect(CANONICAL_ROLE_CODES).toHaveLength(4);
      expect(CANONICAL_ROLE_CODES).toEqual([
        'system_admin',
        'department_head',
        'instructor',
        'student',
      ]);

      // Strict negative check: alumni must NOT be an auth role
      expect(CANONICAL_ROLE_CODES).not.toContain('alumni');
      expect(CANONICAL_ROLE_CODES).not.toContain('admin');
      expect(CANONICAL_ROLE_CODES).not.toContain('super_admin');
    });

    it('contains exact Arabic and English names for canonical roles', () => {
      const roleMap = new Map(CANONICAL_ROLES.map((r) => [r.code, r]));

      expect(roleMap.get('system_admin')).toEqual({
        code: 'system_admin',
        nameAr: 'مدير النظام',
        nameEn: 'System Administrator',
      });
      expect(roleMap.get('department_head')).toEqual({
        code: 'department_head',
        nameAr: 'رئيس القسم',
        nameEn: 'Department Head',
      });
      expect(roleMap.get('instructor')).toEqual({
        code: 'instructor',
        nameAr: 'مدرس',
        nameEn: 'Instructor',
      });
      expect(roleMap.get('student')).toEqual({
        code: 'student',
        nameAr: 'طالب',
        nameEn: 'Student',
      });
    });

    it('defines exact account statuses with NO temporary "locked" state', () => {
      expect(ACCOUNT_STATUSES).toEqual([
        'pending_verification',
        'active',
        'disabled',
      ]);
      // Temporary lockout must use failed_login_count / locked_until, never account_status='locked'
      expect((ACCOUNT_STATUSES as readonly string[])).not.toContain('locked');
    });

    it('defines exact identity scope types', () => {
      expect(IDENTITY_SCOPE_TYPES).toEqual([
        'global',
        'department',
        'program',
        'course_offering',
      ]);
    });
  });

  describe('Entities & Data Mapper Discipline', () => {
    it('registers exactly 9 entities in IdentityModule', () => {
      expect(IDENTITY_ENTITIES).toHaveLength(9);
      expect(IDENTITY_ENTITIES).toContain(UserEntity);
      expect(IDENTITY_ENTITIES).toContain(RoleEntity);
      expect(IDENTITY_ENTITIES).toContain(PermissionEntity);
      expect(IDENTITY_ENTITIES).toContain(RolePermissionEntity);
      expect(IDENTITY_ENTITIES).toContain(UserRoleAssignmentEntity);
      expect(IDENTITY_ENTITIES).toContain(UserSessionEntity);
      expect(IDENTITY_ENTITIES).toContain(EmailVerificationTokenEntity);
      expect(IDENTITY_ENTITIES).toContain(PasswordResetTokenEntity);
      expect(IDENTITY_ENTITIES).toContain(UserAccountStatusEventEntity);
    });

    it('STRICT: No entity inherits from BaseEntity or uses Active Record', () => {
      IDENTITY_ENTITIES.forEach((EntityClass) => {
        const prototype = Object.getPrototypeOf(EntityClass);
        expect(prototype.name).not.toBe('BaseEntity');
        expect(EntityClass.prototype).not.toHaveProperty('save');
        expect(EntityClass.prototype).not.toHaveProperty('remove');
        expect(EntityClass.prototype).not.toHaveProperty('hasId');
      });
    });

    it('STRICT SECURITY: Entities do NOT expose raw password or raw token plaintext fields', () => {
      const userPropNames = Object.getOwnPropertyNames(new UserEntity());
      expect(userPropNames).not.toContain('password');
      expect(userPropNames).not.toContain('plainPassword');
      expect(userPropNames).not.toContain('rawPassword');

      const sessionPropNames = Object.getOwnPropertyNames(new UserSessionEntity());
      expect(sessionPropNames).not.toContain('token');
      expect(sessionPropNames).not.toContain('rawToken');
      expect(sessionPropNames).not.toContain('sessionToken');
      expect(sessionPropNames).not.toContain('csrfToken');

      const emailTokenPropNames = Object.getOwnPropertyNames(new EmailVerificationTokenEntity());
      expect(emailTokenPropNames).not.toContain('token');
      expect(emailTokenPropNames).not.toContain('rawToken');

      const resetTokenPropNames = Object.getOwnPropertyNames(new PasswordResetTokenEntity());
      expect(resetTokenPropNames).not.toContain('token');
      expect(resetTokenPropNames).not.toContain('rawToken');
    });
  });

  describe('Migration Static Verification', () => {
    it('instantiates the foundation migration successfully', () => {
      const migration = new CreateIdentityFoundation1726920000000();
      expect(migration.name).toBe('CreateIdentityFoundation1726920000000');
      expect(typeof migration.up).toBe('function');
      expect(typeof migration.down).toBe('function');
    });

    it('executes up and down queries against mock query runner without SQL errors', async () => {
      const migration = new CreateIdentityFoundation1726920000000();
      const executedQueries: string[] = [];

      const mockQueryRunner = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          executedQueries.push(sql);
          return [];
        }),
      } as any;

      await migration.up(mockQueryRunner);

      const combinedUpSql = executedQueries.join('\n');
      expect(combinedUpSql).toContain('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      expect(combinedUpSql).toContain('CREATE TABLE "users"');
      expect(combinedUpSql).toContain('CREATE TABLE "roles"');
      expect(combinedUpSql).toContain('CREATE TABLE "permissions"');
      expect(combinedUpSql).toContain('CREATE TABLE "role_permissions"');
      expect(combinedUpSql).toContain('CREATE TABLE "user_role_assignments"');
      expect(combinedUpSql).toContain('CREATE TABLE "user_sessions"');
      expect(combinedUpSql).toContain('CREATE TABLE "email_verification_tokens"');
      expect(combinedUpSql).toContain('CREATE TABLE "password_reset_tokens"');
      expect(combinedUpSql).toContain('CREATE TABLE "user_account_status_events"');

      // Check seed data
      expect(combinedUpSql).toContain("'system_admin'");
      expect(combinedUpSql).toContain("'department_head'");
      expect(combinedUpSql).toContain("'instructor'");
      expect(combinedUpSql).toContain("'student'");

      // Verify no permissions or users seeded
      expect(combinedUpSql).not.toContain('INSERT INTO "permissions"');
      expect(combinedUpSql).not.toContain('INSERT INTO "users"');

      // Test down migration
      const executedDownQueries: string[] = [];
      const mockDownQueryRunner = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          executedDownQueries.push(sql);
          return [];
        }),
      } as any;

      await migration.down(mockDownQueryRunner);
      const combinedDownSql = executedDownQueries.join('\n');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "user_account_status_events"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "password_reset_tokens"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "email_verification_tokens"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "user_sessions"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "user_role_assignments"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "role_permissions"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "permissions"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "roles"');
      expect(combinedDownSql).toContain('DROP TABLE IF EXISTS "users"');
    });
  });
});
