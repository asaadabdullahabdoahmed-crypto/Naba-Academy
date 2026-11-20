import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AcademicOperationsService } from './academic-operations.service';
import { AcademicAuthorizationService } from './academic-authorization.service';
import { AcademicOperationsQueryDto } from '../presentation/dto/academic-operations.dto';

describe('AcademicOperationsService feature gate', () => {
  const config = {
    get: jest.fn().mockReturnValue(false),
  } as unknown as jest.Mocked<ConfigService>;
  const dataSource = {
    getRepository: jest.fn(),
    transaction: jest.fn(),
  } as unknown as jest.Mocked<DataSource>;
  const authorization = {
    assertScopedPermission: jest.fn(),
    assertStudentOwns: jest.fn(),
  } as unknown as jest.Mocked<AcademicAuthorizationService>;
  const operations = new AcademicOperationsService(config, dataSource, authorization);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables section reads and writes before authorization or database access', async () => {
    const principal = { id: 'principal-1' } as never;
    const query = Object.assign(new AcademicOperationsQueryDto(), {
      departmentId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });

    await expect(operations.listSections(query, principal)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    await expect(
      operations.createSection(
        {
          courseOfferingId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          code: 'SEC-1',
          capacity: 1,
          schedule: [],
        },
        principal,
      ),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(authorization.assertScopedPermission).not.toHaveBeenCalled();
    expect(dataSource.getRepository).not.toHaveBeenCalled();
    expect(dataSource.transaction).not.toHaveBeenCalled();
  });
});
