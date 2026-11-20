import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  MinLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AcademicCatalogQueryDto } from './academic-catalog-query.dto';

export class AcademicOperationsQueryDto extends AcademicCatalogQueryDto {
  @IsUUID('4')
  departmentId!: string;

  @IsOptional()
  @IsIn(['planned', 'open', 'closed'])
  status?: 'planned' | 'open' | 'closed';
}

export class AvailableSectionsQueryDto extends AcademicCatalogQueryDto {}

export class AcademicSectionMeetingDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  startsAt!: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  endsAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}

export class CreateAcademicSectionDto {
  @IsUUID('4')
  courseOfferingId!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  code!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  capacity!: number;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AcademicSectionMeetingDto)
  schedule!: AcademicSectionMeetingDto[];

  @IsOptional()
  @IsDateString()
  enrollmentOpensAt?: string | null;

  @IsOptional()
  @IsDateString()
  enrollmentClosesAt?: string | null;
}

export class UpdateAcademicSectionDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  capacity?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AcademicSectionMeetingDto)
  schedule?: AcademicSectionMeetingDto[] | null;

  @IsOptional()
  @IsDateString()
  enrollmentOpensAt?: string | null;

  @IsOptional()
  @IsDateString()
  enrollmentClosesAt?: string | null;
}

export class AssignTeacherDto {
  @IsUUID('4')
  teacherUserId!: string;
}

export class AdminEnrollStudentDto {
  @IsUUID('4')
  studentUserId!: string;
}

export class StudentEnrollDto {
  @IsUUID('4')
  sectionId!: string;
}

export class CancelEnrollmentDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(500)
  reason?: string;
}
