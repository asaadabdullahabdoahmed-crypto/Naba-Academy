import { afterEach, describe, expect, it, vi } from 'vitest';
import { teachingCatalogClient } from './teachingCatalogClient';

describe('Teaching catalog HTTP client', () => {
  afterEach(() => { vi.unstubAllGlobals(); });
  it('uses credentialed read-only API requests, preserves page metadata, and encodes filters', async () => {
    const meta = { page: 2, pageSize: 5, totalItems: 12, totalPages: 3, hasNext: true, hasPrevious: true };
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ success: true, data: [], meta }), { headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    const result = await teachingCatalogClient.listCourses({ page: 2, pageSize: 5, search: ' A&B ', departmentId: 'department-id' }, controller.signal);
    expect(result).toEqual({ data: [], meta });
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/academic/courses?page=2&pageSize=5&search=A%26B&departmentId=department-id'), expect.objectContaining({ method: 'GET', credentials: 'include', cache: 'no-store', signal: controller.signal }));
    await teachingCatalogClient.getCourse('id/with?query');
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/academic/courses/id%2Fwith%3Fquery'), expect.anything());
    await teachingCatalogClient.listCourseOfferings('course-id', { termId: 'term-id', page: 1 });
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/academic/courses/course-id/offerings?page=1&termId=term-id'), expect.anything());
    await teachingCatalogClient.listTerms({ page: 1 });
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/academic/terms?page=1'), expect.anything());
    await teachingCatalogClient.getTerm('term-id');
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/academic/terms/term-id'), expect.anything());
  });
});
