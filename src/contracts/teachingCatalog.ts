import type { AcademicCatalogPage, AcademicCatalogSummary } from './academicCatalog';

export type ReferenceName = Pick<AcademicCatalogSummary, 'id' | 'code' | 'nameAr' | 'nameEn'>;

export interface CourseReference extends AcademicCatalogSummary {
  department: ReferenceName;
  college: ReferenceName;
  university: ReferenceName | null;
}

export interface TermReference extends ReferenceName {
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startsOn: string;
  endsOn: string;
}

/** An offering is reference data, not a section or a verified teaching assignment. */
export interface OfferingReference {
  id: string;
  courseId: string;
  code: string;
  status: 'planned' | 'open' | 'closed' | 'cancelled';
  term: TermReference;
}

export interface ReferenceQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

export type ReferencePage<T> = AcademicCatalogPage<T>;
