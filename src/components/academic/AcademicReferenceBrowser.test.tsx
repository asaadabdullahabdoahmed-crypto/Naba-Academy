import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';
import { teachingCatalogClient } from '../../services/teachingCatalogClient';
import { AdminCoursesPage } from '../../views/admin/AdminCoursesPage';
import { InstructorCoursesPage } from '../../views/instructor/InstructorCoursesPage';
import { InstructorCourseDetailPage } from '../../views/instructor/InstructorCourseDetailPage';
import type { CourseReference } from '../../contracts/teachingCatalog';

vi.mock('../scaffold/PortalPage', () => ({ PortalPage: ({ title, children }: { title: string; children: React.ReactNode }) => <div><h1>{title}</h1>{children}</div> }));
vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
let isAr = false;
vi.mock('../../i18n/dictionaries', () => ({ useTranslation: () => ({ isAr }) }));
vi.mock('../../services/teachingCatalogClient', () => ({ teachingCatalogClient: {
  listCourses: vi.fn(), getCourse: vi.fn(), listTerms: vi.fn(), getTerm: vi.fn(), listCourseOfferings: vi.fn(),
} }));

const course: CourseReference = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', code: 'CS101', nameEn: 'Computing', nameAr: 'الحوسبة', status: 'active',
  department: { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', code: 'CS', nameAr: 'قسم الحاسوب', nameEn: 'Computer Science' },
  college: { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', code: 'SCI', nameAr: 'كلية العلوم', nameEn: 'Science' }, university: null,
};
const meta = { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false };
const refreshUser = vi.fn();
function renderPortal(path = '/en/admin/courses') {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/:locale/admin/courses" element={<AdminCoursesPage locale="en" />} />
    <Route path="/:locale/admin/terms" element={<AdminCoursesPage locale="en" />} />
    <Route path="/:locale/instructor/courses" element={<InstructorCoursesPage locale={isAr ? 'ar' : 'en'} />} />
    <Route path="/:locale/instructor/terms" element={<InstructorCoursesPage locale="en" />} />
    <Route path="/:locale/instructor/courses/:courseId" element={<InstructorCourseDetailPage locale="en" />} />
    <Route path="/:locale/admin/courses/:courseId" element={<AdminCoursesPage locale="en" />} />
  </Routes></MemoryRouter>);
}

describe('Admin and Teacher academic reference workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks(); isAr = false;
    vi.stubEnv('VITE_ACADEMIC_CATALOG_READS_ENABLED', 'true');
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'staff-user' }, isLoading: false, refreshUser } as never);
    vi.mocked(teachingCatalogClient.listCourses).mockResolvedValue({ data: [course], meta });
    vi.mocked(teachingCatalogClient.getCourse).mockResolvedValue(course);
    vi.mocked(teachingCatalogClient.listTerms).mockResolvedValue({ data: [], meta: { ...meta, totalItems: 0, totalPages: 0 } });
    vi.mocked(teachingCatalogClient.listCourseOfferings).mockResolvedValue({ data: [], meta: { ...meta, totalItems: 0, totalPages: 0 } });
  });
  afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

  it.each(['/en/admin/courses', '/en/instructor/courses', '/en/admin/terms', `/en/instructor/courses/${course.id}`])('makes no academic requests while the frontend flag is disabled: %s', (path) => {
    vi.stubEnv('VITE_ACADEMIC_CATALOG_READS_ENABLED', 'false');
    renderPortal(path);
    expect(screen.getByText('The catalog is currently unavailable')).toBeTruthy();
    for (const method of Object.values(teachingCatalogClient)) expect(method).not.toHaveBeenCalled();
    expect(screen.queryByText('No matching records')).toBeNull();
  });

  it.each(['/en/admin/courses', '/en/instructor/courses'])('loads real client data and supports department filtering: %s', async (path) => {
    renderPortal(path);
    expect(await screen.findByRole('link', { name: 'Computing' })).toBeTruthy();
    expect(screen.getByText(/do not establish teaching assignments/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Browse this department' }));
    await waitFor(() => expect(teachingCatalogClient.listCourses).toHaveBeenLastCalledWith(expect.objectContaining({ departmentId: course.department.id, page: 1 }), expect.any(AbortSignal)));
    fireEvent.click(screen.getByRole('button', { name: 'Clear department filter' }));
    await waitFor(() => expect(teachingCatalogClient.listCourses).toHaveBeenLastCalledWith(expect.objectContaining({ departmentId: undefined }), expect.any(AbortSignal)));
  });

  it('uses server pagination and resets to page one when search changes', async () => {
    vi.mocked(teachingCatalogClient.listCourses).mockResolvedValue({ data: [course], meta: { ...meta, totalItems: 21, totalPages: 2, hasNext: true } });
    renderPortal();
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    await waitFor(() => expect(teachingCatalogClient.listCourses).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.any(AbortSignal)));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  CS101  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(teachingCatalogClient.listCourses).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: 'CS101' }), expect.any(AbortSignal)));
  });

  it('distinguishes a successful empty result from a backend-disabled response', async () => {
    vi.mocked(teachingCatalogClient.listCourses).mockRejectedValueOnce(new ApiError('disabled', 'HTTP_503', 503));
    renderPortal();
    expect(await screen.findByText('The catalog is currently unavailable')).toBeTruthy();
    expect(screen.queryByText('No matching records')).toBeNull();
    cleanup();
    vi.mocked(teachingCatalogClient.listCourses).mockResolvedValue({ data: [], meta: { ...meta, totalItems: 0, totalPages: 0 } });
    renderPortal();
    expect(await screen.findByText('No matching records')).toBeTruthy();
    expect(screen.getByText('0 records — Page 1 of 1')).toBeTruthy();
  });

  it('offers retry after a network error and never displays a false empty state', async () => {
    vi.mocked(teachingCatalogClient.listCourses).mockRejectedValueOnce(new Error('offline'));
    renderPortal();
    fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('link', { name: 'Computing' })).toBeTruthy();
    expect(teachingCatalogClient.listCourses).toHaveBeenCalledTimes(2);
  });

  it.each([[403, 'FORBIDDEN', 'You are not authorized to view this catalog', false], [403, 'SESSION_REVOKED', 'Sign in to view the catalog', true], [404, 'NOT_FOUND', 'The record was not found or is no longer available', false]] as const)('handles status %s / %s without leaking prior records', async (status, code, message, refresh) => {
    vi.mocked(teachingCatalogClient.listCourses).mockRejectedValue(new ApiError('blocked', code, status));
    renderPortal();
    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.queryByText('Computing')).toBeNull();
    expect(refreshUser).toHaveBeenCalledTimes(refresh ? 1 : 0);
  });

  it('renders teacher course details and paginated offering reference data', async () => {
    vi.mocked(teachingCatalogClient.listCourseOfferings).mockResolvedValue({ data: [{ id: 'offering-1', courseId: course.id, code: 'CS-FALL', status: 'closed', term: {
      id: 'term-1', code: 'FALL26', nameAr: 'الخريف', nameEn: 'Autumn', status: 'completed', startsOn: '2026-01-01', endsOn: '2026-06-01',
    } }], meta });
    renderPortal('/en/instructor/courses');
    fireEvent.click(await screen.findByRole('link', { name: 'Computing' }));
    expect(await screen.findByText('CS-FALL')).toBeTruthy();
    expect(screen.getByText('Autumn · FALL26')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /roster/i })).toBeNull();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Autumn' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(teachingCatalogClient.listCourseOfferings).toHaveBeenLastCalledWith(course.id, expect.objectContaining({ search: 'Autumn', page: 1 }), expect.any(AbortSignal)));
  });

  it('navigates admin courses to terms and displays stored dates and statuses', async () => {
    vi.mocked(teachingCatalogClient.listTerms).mockResolvedValue({ data: [{ id: 'term-1', code: 'FALL26', nameAr: 'الخريف', nameEn: 'Autumn', status: 'cancelled', startsOn: '2026-01-01', endsOn: '2026-06-01' }], meta });
    renderPortal();
    fireEvent.click(screen.getByRole('link', { name: 'Terms' }));
    expect(await screen.findByText('Autumn')).toBeTruthy();
    expect(screen.getByText('2026-01-01')).toBeTruthy();
    expect(screen.getByText(/Cancelled/)).toBeTruthy();
    expect(teachingCatalogClient.listTerms).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }), expect.any(AbortSignal));
  });

  it('supports Arabic course names and labels', async () => {
    isAr = true;
    renderPortal('/ar/instructor/courses');
    expect(await screen.findByRole('link', { name: 'الحوسبة' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'دليل المقررات' })).toBeTruthy();
  });

  it('does not request catalog records without an authenticated user', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, isLoading: false, refreshUser } as never);
    renderPortal();
    expect(screen.getByText('Sign in to view the catalog')).toBeTruthy();
    expect(teachingCatalogClient.listCourses).not.toHaveBeenCalled();
  });

  it('aborts an obsolete request and ignores its late result', async () => {
    let resolve!: (value: { data: CourseReference[]; meta: typeof meta }) => void;
    vi.mocked(teachingCatalogClient.listCourses).mockReturnValueOnce(new Promise((done) => { resolve = done; }));
    renderPortal();
    const signal = vi.mocked(teachingCatalogClient.listCourses).mock.calls[0][1]!;
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'new' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('link', { name: 'Computing' })).toBeTruthy();
    expect(signal.aborted).toBe(true);
    resolve({ data: [{ ...course, nameEn: 'Stale record' }], meta });
    await waitFor(() => expect(screen.queryByText('Stale record')).toBeNull());
  });
});
