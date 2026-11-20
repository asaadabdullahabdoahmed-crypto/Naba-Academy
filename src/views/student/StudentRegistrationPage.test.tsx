import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { academicOperationsClient } from '../../services/academicOperationsClient';
import { ApiError } from '../../services/apiClient';

vi.mock('../../components/scaffold/PortalPage', () => ({
  PortalPage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../i18n/dictionaries', () => ({
  useTranslation: () => ({ isAr: false }),
}));

vi.mock('../../services/academicOperationsClient', () => ({
  academicOperationsClient: {
    listAvailableSections: vi.fn(),
    listMyEnrollments: vi.fn(),
    enrollMyself: vi.fn(),
    cancelMyEnrollment: vi.fn(),
  },
}));

vi.mock('../../services/apiClient', () => ({
  ApiError: class ApiError extends Error {
    constructor(message: string, public code: string, public status: number) {
      super(message);
    }
  },
}));

const page = <T,>(data: T[]) => ({
  data,
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: data.length,
    totalPages: data.length ? 1 : 0,
    hasNext: false,
    hasPrevious: false,
  },
});

const section = {
  id: 'section-1',
  courseOfferingId: 'offering-1',
  code: 'SEC-1',
  capacity: 10,
  activeEnrollmentCount: 9,
  seatsAvailable: 1,
  status: 'open' as const,
  schedule: [],
  enrollmentOpensAt: '2026-01-01T00:00:00.000Z',
  enrollmentClosesAt: '2027-01-01T00:00:00.000Z',
  course: {
    id: 'course-1',
    code: 'CS1',
    nameAr: 'مقرر',
    nameEn: 'Course One',
    departmentId: 'department-1',
  },
  term: {
    id: 'term-1',
    code: 'TERM-1',
    nameAr: 'الفصل',
    nameEn: 'Term One',
    startsOn: '2026-01-01',
    endsOn: '2026-12-31',
    status: 'active' as const,
  },
  canEnroll: true,
  eligibilityMessage: null,
};

const emptyEnrollments = page([]);
const operations = vi.mocked(academicOperationsClient);

let StudentRegistrationPage: typeof import('./StudentRegistrationPage').StudentRegistrationPage;

beforeEach(async () => {
  vi.clearAllMocks();
  operations.listAvailableSections.mockResolvedValue(page([section]));
  operations.listMyEnrollments.mockResolvedValue(emptyEnrollments);
  ({ StudentRegistrationPage } = await import('./StudentRegistrationPage'));
});

afterEach(() => cleanup());

describe('StudentRegistrationPage', () => {
  it('shows server-backed sections and does not report success when enrollment is rejected', async () => {
    operations.enrollMyself.mockRejectedValue(new ApiError('Enrollment window is not open', 'HTTP_409', 409));
    render(<StudentRegistrationPage locale="en" />);

    expect(await screen.findByText('SEC-1 · Course One')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Enroll' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Enrollment window is not open');
    expect(operations.enrollMyself).toHaveBeenCalledWith('section-1');
    expect(operations.listAvailableSections).toHaveBeenCalledTimes(1);
  });

  it('shows the disabled backend feature state without presenting mock sections', async () => {
    operations.listAvailableSections.mockRejectedValue(new ApiError('disabled', 'HTTP_503', 503));
    operations.listMyEnrollments.mockRejectedValue(new ApiError('disabled', 'HTTP_503', 503));
    render(<StudentRegistrationPage locale="en" />);

    await waitFor(() => {
      expect(screen.getAllByRole('alert')).toHaveLength(2);
    });
    expect(screen.getAllByText('Academic operations are disabled in this environment.')).toHaveLength(2);
    expect(screen.queryByText('SEC-1 · Course One')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Enroll' })).toBeNull();
  });
});
