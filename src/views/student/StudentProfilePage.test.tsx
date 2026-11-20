import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SafeUserProfile } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { academicCatalogClient } from '../../services/academicCatalogClient';
import { ApiError, apiClient } from '../../services/apiClient';
import type {
  AcademicCatalogPage,
  RecordedStudentAcademicPlacement,
} from '../../contracts/academicCatalog';

vi.mock('../../components/scaffold/PortalPage', () => ({
  PortalPage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../i18n/dictionaries', () => ({
  useTranslation: () => ({ isAr: false }),
}));

vi.mock('../../services/academicCatalogClient', () => ({
  academicCatalogClient: {
    getMyPlacement: vi.fn(),
    listMyPlacementHistory: vi.fn(),
  },
}));

vi.mock('../../services/apiClient', () => ({
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public code: string,
      public status: number,
    ) {
      super(message);
    }
  },
  apiClient: {
    get: vi.fn(),
  },
}));

const user: SafeUserProfile = {
  id: 'student-1',
  email: 'student@example.test',
  nameAr: 'طالب',
  nameEn: 'Student',
  accountStatus: 'active',
  primaryRole: 'student',
  roles: [{ code: 'student' }],
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const historyPage: AcademicCatalogPage<RecordedStudentAcademicPlacement> = {
  data: [
    {
      id: 'placement-1',
      effectiveFrom: '2026-09-01',
      effectiveTo: null,
      recordedAt: '2026-08-20T10:00:00.000Z',
      program: {
        id: 'program-1',
        code: 'P1',
        nameAr: 'البرنامج',
        nameEn: 'History Program',
        status: 'active',
        departmentId: 'department-1',
        credentialLevel: {
          id: 'credential-1',
          code: 'BACHELOR',
          nameAr: 'بكالوريوس',
          nameEn: 'Bachelor',
          status: 'active',
        },
        department: {
          id: 'department-1',
          code: 'D1',
          nameAr: 'القسم',
          nameEn: 'Department',
          status: 'active',
          collegeId: 'college-1',
          college: {
            id: 'college-1',
            code: 'C1',
            nameAr: 'الكلية',
            nameEn: 'College',
            status: 'active',
            universityId: null,
            university: null,
          },
        },
      },
    },
  ],
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
};

let StudentProfilePage: typeof import('./StudentProfilePage').StudentProfilePage;

beforeAll(async () => {
  vi.stubEnv('VITE_ACADEMIC_CATALOG_READS_ENABLED', 'true');
  ({ StudentProfilePage } = await import('./StudentProfilePage'));
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('StudentProfilePage placement history session handling', () => {
  const refreshUser = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser,
      clearError: vi.fn(),
    });
    vi.mocked(apiClient.get).mockResolvedValue({
      departmentId: null,
      departmentAr: null,
      departmentEn: null,
      collegeAr: null,
      collegeEn: null,
    });
    vi.mocked(academicCatalogClient.getMyPlacement).mockResolvedValue({ current: null });
    vi.mocked(academicCatalogClient.listMyPlacementHistory).mockResolvedValue(historyPage);
  });

  afterEach(() => {
    cleanup();
  });

  it('refreshes authentication after an HTTP 401 session failure', async () => {
    vi.mocked(academicCatalogClient.listMyPlacementHistory).mockRejectedValue(
      new ApiError('Authentication required', 'UNAUTHORIZED', 401),
    );

    render(<StudentProfilePage locale="en" />);

    expect(await screen.findByText('A valid session is required to view placement history.'))
      .toBeTruthy();
    expect(refreshUser).toHaveBeenCalledOnce();
  });

  it('refreshes authentication for HTTP 403 SESSION_REVOKED', async () => {
    vi.mocked(academicCatalogClient.listMyPlacementHistory).mockRejectedValue(
      new ApiError('Session expired', 'SESSION_REVOKED', 403),
    );

    render(<StudentProfilePage locale="en" />);

    expect(await screen.findByText('A valid session is required to view placement history.'))
      .toBeTruthy();
    expect(refreshUser).toHaveBeenCalledOnce();
  });

  it('keeps genuine HTTP 403 authorization failures distinct from session failures', async () => {
    vi.mocked(academicCatalogClient.listMyPlacementHistory).mockRejectedValue(
      new ApiError('Forbidden', 'FORBIDDEN', 403),
    );

    render(<StudentProfilePage locale="en" />);

    expect(await screen.findByText('You are not authorized to view placement history.'))
      .toBeTruthy();
    expect(refreshUser).not.toHaveBeenCalled();
  });

  it('renders successfully loaded placement history without refreshing authentication', async () => {
    render(<StudentProfilePage locale="en" />);

    expect(await screen.findByText('History Program')).toBeTruthy();
    expect(screen.getByText('Effective: 2026-09-01 – Ongoing')).toBeTruthy();
    expect(refreshUser).not.toHaveBeenCalled();
  });
});
