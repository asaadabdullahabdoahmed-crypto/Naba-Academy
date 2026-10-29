import { StudentAcademicProfileController } from './student-academic-profile.controller';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';

describe('StudentAcademicProfileController', () => {
  it('returns only academic fields already present in the identity schema', () => {
    const controller = new StudentAcademicProfileController();
    const user = {
      departmentId: 'dept-1',
      departmentAr: 'القسم',
      departmentEn: 'Department',
      collegeAr: 'الكلية',
      collegeEn: 'College',
      email: 'private@example.test',
    } as UserEntity;

    expect(controller.getMyAcademicProfile(user)).toEqual({
      departmentId: 'dept-1',
      departmentAr: 'القسم',
      departmentEn: 'Department',
      collegeAr: 'الكلية',
      collegeEn: 'College',
    });
  });
});
