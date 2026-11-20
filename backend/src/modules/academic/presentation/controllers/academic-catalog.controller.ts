import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { AcademicCatalogService } from '../../application/academic-catalog.service';
import { AcademicCatalogQueryDto } from '../dto/academic-catalog-query.dto';

@Controller('academic')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('system_admin', 'department_head', 'instructor', 'student')
export class AcademicCatalogController {
  constructor(private readonly academicCatalog: AcademicCatalogService) {}

  @Get('universities')
  listUniversities(@Query() query: AcademicCatalogQueryDto) {
    return this.academicCatalog.listUniversities(query);
  }

  @Get('universities/:universityId')
  getUniversity(
    @Param('universityId', new ParseUUIDPipe({ version: '4' })) universityId: string,
  ) {
    return this.academicCatalog.getUniversity(universityId);
  }

  @Get('universities/:universityId/colleges')
  listUniversityColleges(
    @Param('universityId', new ParseUUIDPipe({ version: '4' })) universityId: string,
    @Query() query: AcademicCatalogQueryDto,
  ) {
    return this.academicCatalog.listColleges({ ...query, universityId });
  }

  @Get('colleges')
  listColleges(@Query() query: AcademicCatalogQueryDto) {
    return this.academicCatalog.listColleges(query);
  }

  @Get('colleges/:collegeId')
  getCollege(
    @Param('collegeId', new ParseUUIDPipe({ version: '4' })) collegeId: string,
  ) {
    return this.academicCatalog.getCollege(collegeId);
  }

  @Get('credential-levels')
  listCredentialLevels(@Query() query: AcademicCatalogQueryDto) {
    return this.academicCatalog.listCredentialLevels(query);
  }

  @Get('colleges/:collegeId/departments')
  listDepartments(
    @Param('collegeId', new ParseUUIDPipe({ version: '4' })) collegeId: string,
    @Query() query: AcademicCatalogQueryDto,
  ) {
    return this.academicCatalog.listDepartments(collegeId, query);
  }

  @Get('departments/:departmentId/programs')
  listPrograms(
    @Param('departmentId', new ParseUUIDPipe({ version: '4' })) departmentId: string,
    @Query() query: AcademicCatalogQueryDto,
  ) {
    return this.academicCatalog.listPrograms(departmentId, query);
  }

  @Get('departments/:departmentId')
  getDepartment(
    @Param('departmentId', new ParseUUIDPipe({ version: '4' })) departmentId: string,
  ) {
    return this.academicCatalog.getDepartment(departmentId);
  }

  @Get('programs/:programId')
  getProgram(
    @Param('programId', new ParseUUIDPipe({ version: '4' })) programId: string,
  ) {
    return this.academicCatalog.getProgram(programId);
  }
}
