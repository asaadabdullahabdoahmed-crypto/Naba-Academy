import type { CourseReference, OfferingReference, ReferencePage, ReferenceQuery, TermReference } from '../contracts/teachingCatalog';
import { apiClient } from './apiClient';

function queryString(query: ReferenceQuery & { departmentId?: string; termId?: string } = {}) {
  const params = new URLSearchParams();
  for (const key of ['page', 'pageSize', 'search', 'departmentId', 'termId'] as const) {
    const value = query[key];
    if (value !== undefined && String(value).trim()) params.set(key, String(value).trim());
  }
  return params.size ? `?${params}` : '';
}

export const teachingCatalogClient = {
  listCourses: (query: ReferenceQuery & { departmentId?: string }, signal?: AbortSignal) =>
    apiClient.get<ReferencePage<CourseReference>>(`/academic/courses${queryString(query)}`, { signal, cache: 'no-store' }),
  getCourse: (id: string, signal?: AbortSignal) =>
    apiClient.get<CourseReference>(`/academic/courses/${encodeURIComponent(id)}`, { signal, cache: 'no-store' }),
  listTerms: (query: ReferenceQuery, signal?: AbortSignal) =>
    apiClient.get<ReferencePage<TermReference>>(`/academic/terms${queryString(query)}`, { signal, cache: 'no-store' }),
  getTerm: (id: string, signal?: AbortSignal) =>
    apiClient.get<TermReference>(`/academic/terms/${encodeURIComponent(id)}`, { signal, cache: 'no-store' }),
  listCourseOfferings: (id: string, query: ReferenceQuery & { termId?: string }, signal?: AbortSignal) =>
    apiClient.get<ReferencePage<OfferingReference>>(`/academic/courses/${encodeURIComponent(id)}/offerings${queryString(query)}`, { signal, cache: 'no-store' }),
};
