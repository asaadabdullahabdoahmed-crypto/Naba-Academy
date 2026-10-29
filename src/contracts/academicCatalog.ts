export interface AcademicCatalogSummary {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: 'active' | 'inactive';
}

export interface AcademicCatalogPage<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface CollegeCatalogItem extends AcademicCatalogSummary {}

export interface DepartmentCatalogItem extends AcademicCatalogSummary {
  collegeId: string;
}

export interface CredentialLevelCatalogItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  status: 'active' | 'inactive';
}

export interface ProgramCatalogItem extends AcademicCatalogSummary {
  departmentId: string;
  credentialLevel: CredentialLevelCatalogItem;
}

export interface ProgramCatalogDetail extends ProgramCatalogItem {
  department: DepartmentCatalogItem & {
    college: CollegeCatalogItem;
  };
}

export interface AcademicCatalogQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}
