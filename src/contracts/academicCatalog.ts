export interface AcademicCatalogSummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: 'active' | 'inactive';
}

export interface UniversityCatalogItem extends AcademicCatalogSummary {}

export interface AcademicCatalogPage<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface CollegeCatalogItem extends AcademicCatalogSummary {
  universityId: string | null;
}

export interface CollegeCatalogDetail extends CollegeCatalogItem {
  university: UniversityCatalogItem | null;
}

export interface DepartmentCatalogItem extends AcademicCatalogSummary {
  collegeId: string;
}

export interface DepartmentCatalogDetail extends DepartmentCatalogItem {
  college: CollegeCatalogDetail;
}

export type CredentialLevelCatalogItem = AcademicCatalogSummary;

export interface ProgramCatalogItem extends AcademicCatalogSummary {
  departmentId: string;
  credentialLevel: CredentialLevelCatalogItem;
}

export interface ProgramCatalogDetail extends ProgramCatalogItem {
  department: DepartmentCatalogDetail;
}

export interface StudentAcademicPlacement {
  id: string;
  effectiveFrom: string;
  program: ProgramCatalogDetail;
}

export interface RecordedStudentAcademicPlacement extends StudentAcademicPlacement {
  effectiveTo: string | null;
  recordedAt: string;
}

export interface StudentAcademicPlacementResponse {
  current: StudentAcademicPlacement | null;
}

export interface AcademicCatalogQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  universityId?: string;
}
