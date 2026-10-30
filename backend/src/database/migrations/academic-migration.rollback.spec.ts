import { DataSource, QueryRunner } from 'typeorm';
import { CreateAcademicFoundation1793299914088 } from './1793299914088-CreateAcademicFoundation';
import { AddUniversityCatalog1793362429913 } from './1793362429913-AddUniversityCatalog';

describe('academic migration rollback safety', () => {
  const createQueryRunner = (initiallyActive = false) => {
    const queryRunner = new DataSource({ type: 'postgres' }).createQueryRunner();
    let transactionActive = initiallyActive;
    Object.defineProperty(queryRunner, 'isTransactionActive', {
      configurable: true,
      get: () => transactionActive,
    });
    const query = jest.spyOn(queryRunner, 'query').mockResolvedValue([{ has_data: false }]);
    const startTransaction = jest
      .spyOn(queryRunner, 'startTransaction')
      .mockImplementation(async () => {
        transactionActive = true;
      });
    const commitTransaction = jest
      .spyOn(queryRunner, 'commitTransaction')
      .mockImplementation(async () => {
        transactionActive = false;
      });
    const rollbackTransaction = jest
      .spyOn(queryRunner, 'rollbackTransaction')
      .mockImplementation(async () => {
        transactionActive = false;
      });

    return { queryRunner, query, startTransaction, commitTransaction, rollbackTransaction };
  };

  it('locks the university child before its parent and holds the lock through checks and DDL', async () => {
    const { queryRunner, query, startTransaction, commitTransaction } = createQueryRunner();

    await new AddUniversityCatalog1793362429913().down(queryRunner);

    const statements = query.mock.calls.map(([statement]) => statement);
    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(statements.slice(0, 2)).toEqual([
      'LOCK TABLE "colleges" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "universities" IN ACCESS EXCLUSIVE MODE',
    ]);
    expect(statements.indexOf('DROP TABLE "universities"')).toBeGreaterThan(1);
    expect(commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('rolls back its lock transaction and performs no drops when university data exists', async () => {
    const { queryRunner, query, startTransaction, rollbackTransaction } = createQueryRunner();
    query.mockImplementation(async (statement: string) => {
      if (statement.includes('FROM "universities"')) return [{ has_data: true }];
      return [{ has_data: false }];
    });

    await expect(new AddUniversityCatalog1793362429913().down(queryRunner)).rejects.toThrow(
      /Refusing to remove university catalog data/,
    );

    const statements = query.mock.calls.map(([statement]) => statement);
    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(statements.slice(0, 2)).toEqual([
      'LOCK TABLE "colleges" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "universities" IN ACCESS EXCLUSIVE MODE',
    ]);
    expect(statements.some((statement) => statement.startsWith('DROP '))).toBe(false);
    expect(rollbackTransaction).toHaveBeenCalledTimes(1);
  });

  it('locks academic tables child-first before checking or dropping data', async () => {
    const { queryRunner, query, startTransaction, commitTransaction } = createQueryRunner();

    await new CreateAcademicFoundation1793299914088().down(queryRunner);

    const statements = query.mock.calls.map(([statement]) => statement);
    expect(startTransaction).toHaveBeenCalledTimes(1);
    expect(statements.slice(0, 8)).toEqual([
      'LOCK TABLE "course_offerings" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "courses" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "academic_terms" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "student_academic_placements" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "academic_programs" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "credential_levels" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "departments" IN ACCESS EXCLUSIVE MODE',
      'LOCK TABLE "colleges" IN ACCESS EXCLUSIVE MODE',
    ]);
    expect(statements[8]).toMatch(
      /SELECT EXISTS/,
    );
    expect(commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('keeps an existing migration-runner transaction in control', async () => {
    const { queryRunner, startTransaction, commitTransaction, rollbackTransaction } =
      createQueryRunner(true);

    await new AddUniversityCatalog1793362429913().down(queryRunner);

    expect(startTransaction).not.toHaveBeenCalled();
    expect(commitTransaction).not.toHaveBeenCalled();
    expect(rollbackTransaction).not.toHaveBeenCalled();
  });
});
