import { StudentAcademicProfileController } from './student-academic-profile.controller';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';
import { ROLES_KEY } from '../identity/presentation/decorators/roles.decorator';
import { SessionAuthGuard } from '../identity/presentation/guards/session-auth.guard';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';
import { AcademicCatalogQueryDto } from './presentation/dto/academic-catalog-query.dto';

describe('StudentAcademicProfileController', () => {
  const academicCatalog = {
    getCurrentPlacement: jest.fn(),
    listMyPlacementHistory: jest.fn(),
  };
  const academicAuthorization = {
    assertStudentOwns: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns only academic fields already present in the identity schema', async () => {
    const controller = new StudentAcademicProfileController(
      academicCatalog as never,
      academicAuthorization as never,
    );
    const user = {
      departmentId: 'dept-1',
      departmentAr: 'القسم',
      departmentEn: 'Department',
      collegeAr: 'الكلية',
      collegeEn: 'College',
      email: 'private@example.test',
    } as UserEntity;

    await expect(controller.getMyAcademicProfile(user)).resolves.toEqual({
      departmentId: 'dept-1',
      departmentAr: 'القسم',
      departmentEn: 'Department',
      collegeAr: 'الكلية',
      collegeEn: 'College',
    });
    expect(academicAuthorization.assertStudentOwns).toHaveBeenCalledWith(
      user,
      user.id,
    );
  });

  it('reads only the authenticated student placement', async () => {
    const controller = new StudentAcademicProfileController(
      academicCatalog as never,
      academicAuthorization as never,
    );
    academicCatalog.getCurrentPlacement.mockResolvedValue({ current: null });
    const user = { id: 'student-user-id' } as UserEntity;

    await expect(controller.getMyAcademicPlacement(user)).resolves.toEqual({
      current: null,
    });
    expect(academicCatalog.getCurrentPlacement).toHaveBeenCalledWith(
      'student-user-id',
    );
    expect(academicAuthorization.assertStudentOwns).toHaveBeenCalledWith(
      user,
      user.id,
    );
  });

  it('protects the placement read with session and student-role guards', () => {
    const handler = StudentAcademicProfileController.prototype.getMyAcademicPlacement;
    expect(Reflect.getMetadata('__guards__', handler)).toEqual([
      SessionAuthGuard,
      RolesGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual(['student']);
  });

  it('authorizes recorded placement history using only the authenticated user id', async () => {
    const controller = new StudentAcademicProfileController(
      academicCatalog as never,
      academicAuthorization as never,
    );
    const user = { id: 'student-user-id' } as UserEntity;
    const query = new AcademicCatalogQueryDto();
    academicCatalog.listMyPlacementHistory.mockResolvedValue({ data: [], meta: {} });

    await expect(
      controller.getMyRecordedAcademicPlacementHistory(user, query),
    ).resolves.toEqual({ data: [], meta: {} });
    expect(academicAuthorization.assertStudentOwns).toHaveBeenCalledWith(
      user,
      user.id,
    );
    expect(academicCatalog.listMyPlacementHistory).toHaveBeenCalledWith(
      user.id,
      query,
    );
  });

  it('protects recorded placement history with session and student-role guards', () => {
    const handler =
      StudentAcademicProfileController.prototype.getMyRecordedAcademicPlacementHistory;
    expect(Reflect.getMetadata('__guards__', handler)).toEqual([
      SessionAuthGuard,
      RolesGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual(['student']);
  });
});
