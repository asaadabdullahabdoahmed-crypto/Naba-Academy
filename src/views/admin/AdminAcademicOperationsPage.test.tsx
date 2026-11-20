import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { academicOperationsClient } from '../../services/academicOperationsClient';
import { AdminAcademicOperationsPage } from './AdminAcademicOperationsPage';

vi.mock('../../components/scaffold/PortalPage', () => ({
  PortalPage: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../i18n/dictionaries', () => ({
  useTranslation: () => ({ isAr: false }),
}));

vi.mock('../../services/academicOperationsClient', () => ({
  academicOperationsClient: {
    listSections: vi.fn(),
    listTeachers: vi.fn(),
    listStudents: vi.fn(),
    getSection: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    assignTeacher: vi.fn(),
    adminEnrollStudent: vi.fn(),
    closeSection: vi.fn(),
    openSection: vi.fn(),
    unassignTeacher: vi.fn(),
    adminCancelEnrollment: vi.fn(),
  },
}));

const operations = vi.mocked(academicOperationsClient);

beforeEach(() => {
  vi.clearAllMocks();
  operations.listSections.mockResolvedValue({
    data: [],
    meta: {
      page: 1,
      pageSize: 100,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  });
});

afterEach(() => cleanup());

describe('AdminAcademicOperationsPage', () => {
  it('surfaces section creation errors when no section is selected', async () => {
    operations.createSection.mockRejectedValue(new Error('request failed'));
    render(<AdminAcademicOperationsPage locale="en" />);

    fireEvent.change(screen.getByLabelText('Authorized department ID'), {
      target: { value: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load sections' }));
    await waitFor(() => expect(operations.listSections).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Course offering ID'), {
      target: { value: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
    });
    fireEvent.change(screen.getByLabelText('Section code'), { target: { value: 'SEC-1' } });
    fireEvent.change(screen.getByLabelText('Capacity'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create planned section' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'The request failed. Check the service and retry.',
    );
  });
});
