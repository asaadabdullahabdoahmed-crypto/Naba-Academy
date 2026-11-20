import type {
  AcademicEnrollment,
  AcademicEnrollmentPage,
  AcademicSection,
  AcademicSectionPage,
  AcademicSectionStudent,
  AcademicSectionStudentPage,
  AcademicTeacherAssignment,
  AcademicTeacherAssignmentPage,
  EligibleAcademicSectionPage,
} from '../contracts/academicOperations';
import { apiClient } from './apiClient';

export interface AcademicOperationsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  status?: AcademicSection['status'];
}

export interface AcademicSectionInput {
  courseOfferingId: string;
  code: string;
  capacity: number;
  schedule: AcademicSection['schedule'];
  enrollmentOpensAt: string | null;
  enrollmentClosesAt: string | null;
}

function queryString(query: AcademicOperationsQuery = {}) {
  const params = new URLSearchParams();
  for (const key of ['page', 'pageSize', 'search', 'departmentId', 'status'] as const) {
    const value = query[key];
    if (value !== undefined && String(value).trim()) params.set(key, String(value).trim());
  }
  return params.size ? `?${params}` : '';
}

const noStore = { cache: 'no-store' as RequestCache };

export const academicOperationsClient = {
  listSections: (query: AcademicOperationsQuery, signal?: AbortSignal) =>
    apiClient.get<AcademicSectionPage>(`/academic/sections${queryString(query)}`, { ...noStore, signal }),

  listMySections: (query?: Pick<AcademicOperationsQuery, 'page' | 'pageSize'>, signal?: AbortSignal) =>
    apiClient.get<AcademicSectionPage>(`/academic/sections/my${queryString(query)}`, { ...noStore, signal }),

  listAvailableSections: (query?: Pick<AcademicOperationsQuery, 'page' | 'pageSize' | 'search'>, signal?: AbortSignal) =>
    apiClient.get<EligibleAcademicSectionPage>(`/academic/sections/available${queryString(query)}`, { ...noStore, signal }),

  getSection: (sectionId: string, signal?: AbortSignal) =>
    apiClient.get<AcademicSection>(`/academic/sections/${encodeURIComponent(sectionId)}`, { ...noStore, signal }),

  createSection: (input: AcademicSectionInput) =>
    apiClient.post<AcademicSection>('/academic/sections', input),

  updateSection: (sectionId: string, input: Partial<AcademicSectionInput>) =>
    apiClient.patch<AcademicSection>(`/academic/sections/${encodeURIComponent(sectionId)}`, input),

  openSection: (sectionId: string) =>
    apiClient.post<AcademicSection>(`/academic/sections/${encodeURIComponent(sectionId)}/open`),

  closeSection: (sectionId: string) =>
    apiClient.post<AcademicSection>(`/academic/sections/${encodeURIComponent(sectionId)}/close`),

  listTeachers: (sectionId: string, query?: Pick<AcademicOperationsQuery, 'page' | 'pageSize'>, signal?: AbortSignal) =>
    apiClient.get<AcademicTeacherAssignmentPage>(
      `/academic/sections/${encodeURIComponent(sectionId)}/teachers${queryString(query)}`,
      { ...noStore, signal },
    ),

  assignTeacher: (sectionId: string, teacherUserId: string) =>
    apiClient.post(`/academic/sections/${encodeURIComponent(sectionId)}/teachers`, { teacherUserId }),

  unassignTeacher: (sectionId: string, teacherUserId: string) =>
    apiClient.delete(`/academic/sections/${encodeURIComponent(sectionId)}/teachers/${encodeURIComponent(teacherUserId)}`),

  listStudents: (sectionId: string, query?: Pick<AcademicOperationsQuery, 'page' | 'pageSize'>, signal?: AbortSignal) =>
    apiClient.get<AcademicSectionStudentPage>(
      `/academic/sections/${encodeURIComponent(sectionId)}/students${queryString(query)}`,
      { ...noStore, signal },
    ),

  adminEnrollStudent: (sectionId: string, studentUserId: string) =>
    apiClient.post(`/academic/sections/${encodeURIComponent(sectionId)}/enrollments`, { studentUserId }),

  adminCancelEnrollment: (enrollmentId: string, reason?: string) =>
    apiClient.delete(`/academic/enrollments/${encodeURIComponent(enrollmentId)}`, {
      body: JSON.stringify({ reason }),
    }),

  listMyEnrollments: (query?: Pick<AcademicOperationsQuery, 'page' | 'pageSize'>, signal?: AbortSignal) =>
    apiClient.get<AcademicEnrollmentPage>(`/students/me/academic-enrollments${queryString(query)}`, { ...noStore, signal }),

  enrollMyself: (sectionId: string) =>
    apiClient.post('/students/me/academic-enrollments', { sectionId }),

  cancelMyEnrollment: (enrollmentId: string) =>
    apiClient.delete(`/students/me/academic-enrollments/${encodeURIComponent(enrollmentId)}`),
};
