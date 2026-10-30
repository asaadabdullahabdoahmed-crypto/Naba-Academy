import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SafeUserProfile } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiClient } from '../../services/apiClient';
import { StudentDashboardPage } from './StudentDashboardPage';

vi.mock('../../components/scaffold/PortalPage', () => ({
  PortalPage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../i18n/dictionaries', () => ({
  useTranslation: () => ({ isAr: false }),
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

function renderDashboard() {
  return render(
    <MemoryRouter>
      <StudentDashboardPage locale="en" />
    </MemoryRouter>,
  );
}

describe('StudentDashboardPage academic profile', () => {
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
      departmentId: 'department-1',
      departmentAr: 'قسم الحاسوب',
      departmentEn: 'Computer Science',
      collegeAr: 'كلية العلوم',
      collegeEn: 'College of Science',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('loads the authenticated student academic profile and links to full details', async () => {
    renderDashboard();

    expect(await screen.findByText('Computer Science')).toBeTruthy();
    expect(screen.getByText('College of Science')).toBeTruthy();
    expect(apiClient.get).toHaveBeenCalledWith(
      '/students/me/academic-profile',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(screen.getByRole('link', { name: 'Academic profile' }).getAttribute('href'))
      .toBe('/en/student/profile');
  });

  it('shows a loading state while the profile request is pending', () => {
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}));

    renderDashboard();

    expect(screen.getByText('Loading academic profile...')).toBeTruthy();
  });

  it('shows a neutral unavailable value for empty legacy fields', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      departmentId: null,
      departmentAr: null,
      departmentEn: null,
      collegeAr: null,
      collegeEn: null,
    });

    renderDashboard();

    expect(await screen.findAllByText('Not available')).toHaveLength(2);
  });

  it('offers retry after a load error', async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        departmentId: null,
        departmentAr: null,
        departmentEn: 'Computer Science',
        collegeAr: null,
        collegeEn: 'College of Science',
      });

    renderDashboard();

    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Computer Science')).toBeTruthy();
    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  it('refreshes auth for a revoked session but preserves genuine forbidden behavior', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Session revoked', 'SESSION_REVOKED', 403),
    );

    renderDashboard();

    expect(await screen.findByText('A valid session is required to view your academic profile.'))
      .toBeTruthy();
    expect(refreshUser).toHaveBeenCalledOnce();
  });

  it('does not refresh authentication for a genuine authorization denial', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Forbidden', 'FORBIDDEN', 403),
    );

    renderDashboard();

    expect(await screen.findByText('You are not authorized to view this academic profile.'))
      .toBeTruthy();
    expect(refreshUser).not.toHaveBeenCalled();
  });
});
