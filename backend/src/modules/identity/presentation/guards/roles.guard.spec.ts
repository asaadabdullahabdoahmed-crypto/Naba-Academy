import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { UserRoleAssignmentEntity } from '../../infrastructure/persistence/entities/user-role-assignment.entity';
import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const handler = jest.fn();
  const controller = jest.fn();
  let reflector: Reflector;
  let getAllAndOverride: jest.SpyInstance;
  let roleAssignmentRepository: jest.Mocked<
    Pick<Repository<UserRoleAssignmentEntity>, 'find'>
  >;
  let guard: RolesGuard;

  function createContext(user?: Pick<UserEntity, 'id'>): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    getAllAndOverride = jest.spyOn(reflector, 'getAllAndOverride');
    roleAssignmentRepository = {
      find: jest.fn(),
    };
    guard = new RolesGuard(reflector, roleAssignmentRepository);
  });

  it('allows an authenticated user with an active required role', async () => {
    getAllAndOverride.mockReturnValue(['student']);
    roleAssignmentRepository.find.mockResolvedValue([
      { role: { code: 'student' } } as UserRoleAssignmentEntity,
    ]);

    await expect(
      guard.canActivate(createContext({ id: 'student-1' })),
    ).resolves.toBe(true);
    expect(getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      handler,
      controller,
    ]);
    expect(roleAssignmentRepository.find).toHaveBeenCalledWith({
      where: { userId: 'student-1', revokedAt: expect.anything() },
      relations: ['role'],
    });
  });

  it('denies a user whose active roles do not include a required role', async () => {
    getAllAndOverride.mockReturnValue(['student']);
    roleAssignmentRepository.find.mockResolvedValue([
      { role: { code: 'instructor' } } as UserRoleAssignmentEntity,
    ]);

    await expect(
      guard.canActivate(createContext({ id: 'instructor-1' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('denies access when role requirements are missing or empty', async () => {
    for (const requiredRoles of [undefined, []]) {
      getAllAndOverride.mockReturnValue(requiredRoles);

      await expect(
        guard.canActivate(createContext({ id: 'user-1' })),
      ).rejects.toThrow(ForbiddenException);
    }

    expect(roleAssignmentRepository.find).not.toHaveBeenCalled();
  });

  it('denies role checks without an authenticated user', async () => {
    getAllAndOverride.mockReturnValue(['student']);

    await expect(guard.canActivate(createContext())).rejects.toThrow(
      ForbiddenException,
    );
    expect(roleAssignmentRepository.find).not.toHaveBeenCalled();
  });
});
