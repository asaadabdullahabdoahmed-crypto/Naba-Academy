import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AcademicCatalogQueryDto } from './academic-catalog-query.dto';

describe('AcademicCatalogQueryDto', () => {
  it('transforms bounded pagination and trims search terms', () => {
    const query = plainToInstance(AcademicCatalogQueryDto, {
      page: '2',
      pageSize: '50',
      search: '  computing  ',
    });

    expect(query).toMatchObject({ page: 2, pageSize: 50, search: 'computing' });
    expect(validateSync(query)).toHaveLength(0);
  });

  it('rejects pagination outside the supported bounds', () => {
    const query = plainToInstance(AcademicCatalogQueryDto, {
      page: '0',
      pageSize: '101',
    });

    expect(validateSync(query).length).toBeGreaterThan(0);
  });
});
