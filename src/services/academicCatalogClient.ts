import type {
  AcademicCatalogPage,
  AcademicCatalogQuery,
  CollegeCatalogDetail,
  CollegeCatalogItem,
  CredentialLevelCatalogItem,
  DepartmentCatalogDetail,
  DepartmentCatalogItem,
  ProgramCatalogDetail,
  ProgramCatalogItem,
  RecordedStudentAcademicPlacement,
  StudentAcademicPlacementResponse,
  UniversityCatalogItem,
} from '../contracts/academicCatalog';
import { apiClient } from './apiClient';

function queryString(query: AcademicCatalogQuery = {}): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.universityId) params.set('universityId', query.universityId);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export const academicCatalogClient = {
  listUniversities: (query?: AcademicCatalogQuery, signal?: AbortSignal) =>
    apiClient.get<AcademicCatalogPage<UniversityCatalogItem>>(
      `/academic/universities${queryString(query)}`,
      { signal },
    ),

  getUniversity: (universityId: string, signal?: AbortSignal) =>
    apiClient.get<UniversityCatalogItem>(
      `/academic/universities/${encodeURIComponent(universityId)}`,
      { signal },
    ),

  listColleges: (query?: AcademicCatalogQuery, signal?: AbortSignal) =>
    apiClient.get<AcademicCatalogPage<CollegeCatalogItem>>(
      `/academic/colleges${queryString(query)}`,
      { signal },
    ),

  getCollege: (collegeId: string, signal?: AbortSignal) =>
    apiClient.get<CollegeCatalogDetail>(
      `/academic/colleges/${encodeURIComponent(collegeId)}`,
      { signal },
    ),

  listCredentialLevels: (query?: AcademicCatalogQuery, signal?: AbortSignal) =>
    apiClient.get<AcademicCatalogPage<CredentialLevelCatalogItem>>(
      `/academic/credential-levels${queryString(query)}`,
      { signal },
    ),

  listDepartments: (
    collegeId: string,
    query?: AcademicCatalogQuery,
    signal?: AbortSignal,
  ) =>
    apiClient.get<AcademicCatalogPage<DepartmentCatalogItem>>(
      `/academic/colleges/${encodeURIComponent(collegeId)}/departments${queryString(query)}`,
      { signal },
    ),

  listPrograms: (
    departmentId: string,
    query?: AcademicCatalogQuery,
    signal?: AbortSignal,
  ) =>
    apiClient.get<AcademicCatalogPage<ProgramCatalogItem>>(
      `/academic/departments/${encodeURIComponent(departmentId)}/programs${queryString(query)}`,
      { signal },
    ),

  getDepartment: (departmentId: string, signal?: AbortSignal) =>
    apiClient.get<DepartmentCatalogDetail>(
      `/academic/departments/${encodeURIComponent(departmentId)}`,
      { signal },
    ),

  getProgram: (programId: string, signal?: AbortSignal) =>
    apiClient.get<ProgramCatalogDetail>(
      `/academic/programs/${encodeURIComponent(programId)}`,
      { signal },
    ),

  getMyPlacement: (signal?: AbortSignal) =>
    apiClient.get<StudentAcademicPlacementResponse>(
      '/students/me/academic-placement',
      { signal },
    ),

  listMyPlacementHistory: (
    query?: AcademicCatalogQuery,
    signal?: AbortSignal,
  ) =>
    apiClient.get<AcademicCatalogPage<RecordedStudentAcademicPlacement>>(
      `/students/me/academic-placement-history${queryString(query)}`,
      { signal },
    ),
};
