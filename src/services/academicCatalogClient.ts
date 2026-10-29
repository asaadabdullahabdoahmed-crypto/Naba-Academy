import type {
  AcademicCatalogPage,
  AcademicCatalogQuery,
  CollegeCatalogItem,
  CredentialLevelCatalogItem,
  DepartmentCatalogItem,
  ProgramCatalogDetail,
  ProgramCatalogItem,
} from '../contracts/academicCatalog';
import { apiClient } from './apiClient';

function queryString(query: AcademicCatalogQuery = {}): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
  if (query.search?.trim()) params.set('search', query.search.trim());
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export const academicCatalogClient = {
  listColleges: (query?: AcademicCatalogQuery, signal?: AbortSignal) =>
    apiClient.get<AcademicCatalogPage<CollegeCatalogItem>>(
      `/academic/colleges${queryString(query)}`,
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

  getProgram: (programId: string, signal?: AbortSignal) =>
    apiClient.get<ProgramCatalogDetail>(
      `/academic/programs/${encodeURIComponent(programId)}`,
      { signal },
    ),
};
