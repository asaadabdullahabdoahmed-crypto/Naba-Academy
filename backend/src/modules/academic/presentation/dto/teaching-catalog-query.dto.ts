import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

/** Bounded reference reads only; owner IDs and write/visibility flags are rejected. */
export class TeachingCatalogQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class CourseCatalogQueryDto extends TeachingCatalogQueryDto {
  @IsOptional()
  @IsUUID('4')
  departmentId?: string;
}

export class CourseOfferingQueryDto extends TeachingCatalogQueryDto {
  @IsOptional()
  @IsUUID('4')
  termId?: string;
}
