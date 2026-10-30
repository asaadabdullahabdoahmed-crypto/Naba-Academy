import React, { useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  AcademicCatalogPage,
  CollegeCatalogItem,
  DepartmentCatalogItem,
  ProgramCatalogItem,
  UniversityCatalogItem,
} from '../../contracts/academicCatalog';
import { academicCatalogClient } from '../../services/academicCatalogClient';
import { AcademicCatalogSelectors, type AcademicCatalogSelection } from './AcademicCatalogSelectors';

vi.mock('../../services/academicCatalogClient', () => ({
  academicCatalogClient: {
    listUniversities: vi.fn(),
    listColleges: vi.fn(),
    listDepartments: vi.fn(),
    listPrograms: vi.fn(),
  },
}));

const universityA: UniversityCatalogItem = {
  id: 'university-a',
  code: 'U-A',
  nameAr: 'جامعة أ',
  nameEn: 'University A',
  status: 'active',
};
const universityB: UniversityCatalogItem = {
  ...universityA,
  id: 'university-b',
  code: 'U-B',
  nameAr: 'جامعة ب',
  nameEn: 'University B',
};
const college: CollegeCatalogItem = {
  id: 'college-a',
  code: 'C-A',
  nameAr: 'كلية أ',
  nameEn: 'College A',
  status: 'active',
  universityId: universityA.id,
};
const department: DepartmentCatalogItem = {
  id: 'department-a',
  code: 'D-A',
  nameAr: 'قسم أ',
  nameEn: 'Department A',
  status: 'active',
  collegeId: college.id,
};
const program: ProgramCatalogItem = {
  id: 'program-a',
  code: 'P-A',
  nameAr: 'برنامج أ',
  nameEn: 'Program A',
  status: 'active',
  departmentId: department.id,
  credentialLevel: {
    id: 'credential-a',
    code: 'CR-A',
    nameAr: 'مؤهل أ',
    nameEn: 'Credential A',
    status: 'active',
  },
};

function page<T>(data: T[]): AcademicCatalogPage<T> {
  return {
    data,
    meta: {
      page: 1,
      pageSize: 100,
      totalItems: data.length,
      totalPages: data.length ? 1 : 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

function renderInLocale(element: React.ReactElement, locale = 'ar') {
  return render(
    <MemoryRouter initialEntries={[`/${locale}`]}>
      <Routes>
        <Route path="/:locale/*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

function SelectionHarness() {
  const [value, setValue] = useState<AcademicCatalogSelection>({
    universityId: null,
    collegeId: null,
    departmentId: null,
    programId: null,
  });

  return (
    <>
      <AcademicCatalogSelectors value={value} onChange={setValue} enabled />
      <output data-testid="selection">{JSON.stringify(value)}</output>
    </>
  );
}

describe('AcademicCatalogSelectors', () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.mocked(academicCatalogClient.listUniversities).mockResolvedValue(page([universityA, universityB]));
    vi.mocked(academicCatalogClient.listColleges).mockResolvedValue(page([college]));
    vi.mocked(academicCatalogClient.listDepartments).mockResolvedValue(page([department]));
    vi.mocked(academicCatalogClient.listPrograms).mockResolvedValue(page([program]));
  });

  it('keeps catalog choices unavailable and makes no requests when disabled', () => {
    renderInLocale(
      <AcademicCatalogSelectors
        value={{ universityId: null, collegeId: null, departmentId: null, programId: null }}
        onChange={vi.fn()}
        enabled={false}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain(
      'اختيار الهيكل الأكاديمي غير متاح حتى اعتماد المخطط وتفعيله.',
    );
    expect(academicCatalogClient.listUniversities).not.toHaveBeenCalled();
    expect(academicCatalogClient.listColleges).not.toHaveBeenCalled();
  });

  it('shows loading and honest empty states in Arabic and English', async () => {
    let resolveUniversities!: (result: AcademicCatalogPage<UniversityCatalogItem>) => void;
    vi.mocked(academicCatalogClient.listUniversities).mockReturnValue(
      new Promise((resolve) => {
        resolveUniversities = resolve;
      }),
    );
    vi.mocked(academicCatalogClient.listColleges).mockResolvedValue(page([]));

    const { container } = renderInLocale(
      <AcademicCatalogSelectors
        value={{ universityId: null, collegeId: null, departmentId: null, programId: null }}
        onChange={vi.fn()}
        enabled
      />,
    );

    expect(screen.getByRole('option', { name: 'جارٍ التحميل...' }).textContent).toBe('جارٍ التحميل...');
    const fieldset = container.querySelector('fieldset');
    expect(fieldset?.classList.contains('grid-cols-1')).toBe(true);
    expect(fieldset?.classList.contains('sm:grid-cols-2')).toBe(true);
    expect(fieldset?.classList.contains('lg:grid-cols-4')).toBe(true);
    expect((await screen.findAllByText('لا توجد خيارات متاحة.')).length).toBeGreaterThan(0);
    resolveUniversities(page([]));
    expect((await screen.findByText('لا توجد جامعات مسجلة.')).textContent).toBe('لا توجد جامعات مسجلة.');

    renderInLocale(
      <AcademicCatalogSelectors
        value={{ universityId: null, collegeId: null, departmentId: null, programId: null }}
        onChange={vi.fn()}
        enabled={false}
      />,
      'en',
    );
    expect(screen.getByText('Academic catalog selection is unavailable until the schema is approved and enabled.'))
      .toBeTruthy();
  });

  it('reports a load failure and retries the university request', async () => {
    vi.mocked(academicCatalogClient.listUniversities)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(page([universityA]));

    renderInLocale(
      <AcademicCatalogSelectors
        value={{ universityId: null, collegeId: null, departmentId: null, programId: null }}
        onChange={vi.fn()}
        enabled
      />,
    );

    expect((await screen.findByText('تعذر تحميل الجامعات.')).textContent).toBe('تعذر تحميل الجامعات.');
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }));
    expect((await screen.findByRole('option', { name: 'جامعة أ' })).textContent).toBe('جامعة أ');
    expect(academicCatalogClient.listUniversities).toHaveBeenCalledTimes(2);
  });

  it('loads dependent levels and clears every child selection when the university changes', async () => {
    renderInLocale(<SelectionHarness />);

    await screen.findByRole('option', { name: 'جامعة أ' });
    const universitySelect = screen.getByLabelText('الجامعة');
    fireEvent.change(universitySelect, { target: { value: universityA.id } });
    await screen.findByRole('option', { name: 'كلية أ (C-A)' });
    fireEvent.change(screen.getByLabelText('الكلية'), { target: { value: college.id } });
    await screen.findByRole('option', { name: 'قسم أ (D-A)' });
    fireEvent.change(screen.getByLabelText('القسم'), { target: { value: department.id } });
    await screen.findByRole('option', { name: 'برنامج أ (P-A)' });
    fireEvent.change(screen.getByLabelText('البرنامج الأكاديمي'), { target: { value: program.id } });
    await waitFor(() => {
      expect(JSON.parse(screen.getByTestId('selection').textContent ?? '{}')).toEqual({
        universityId: universityA.id,
        collegeId: college.id,
        departmentId: department.id,
        programId: program.id,
      });
    });

    fireEvent.change(universitySelect, { target: { value: universityB.id } });
    await waitFor(() => {
      expect(JSON.parse(screen.getByTestId('selection').textContent ?? '{}')).toEqual({
        universityId: universityB.id,
        collegeId: null,
        departmentId: null,
        programId: null,
      });
    });
  });
});
