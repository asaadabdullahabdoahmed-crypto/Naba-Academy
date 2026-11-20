import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { UserEntity } from '../../../identity/infrastructure/persistence/entities/user.entity';
import { AcademicOperationsService } from '../../application/academic-operations.service';
import {
  AcademicOperationsQueryDto,
  AdminEnrollStudentDto,
  AssignTeacherDto,
  AvailableSectionsQueryDto,
  CancelEnrollmentDto,
  CreateAcademicSectionDto,
  StudentEnrollDto,
  UpdateAcademicSectionDto,
} from '../dto/academic-operations.dto';
import { AcademicCatalogQueryDto } from '../dto/academic-catalog-query.dto';

@Controller()
@UseGuards(SessionAuthGuard, RolesGuard)
export class AcademicOperationsController {
  constructor(private readonly operations: AcademicOperationsService) {}

  @Get('academic/sections/my')
  @Roles('instructor')
  @Header('Cache-Control', 'no-store')
  listMySections(
    @Query() query: AcademicCatalogQueryDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.listMySections(query, user);
  }

  @Get('academic/sections/available')
  @Roles('student')
  @Header('Cache-Control', 'no-store')
  listAvailableSections(
    @Query() query: AvailableSectionsQueryDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.listAvailableSections(query, user);
  }

  @Get('academic/sections')
  @Roles('system_admin', 'department_head')
  @Header('Cache-Control', 'no-store')
  listSections(
    @Query() query: AcademicOperationsQueryDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.listSections(query, user);
  }

  @Post('academic/sections')
  @Roles('system_admin', 'department_head')
  createSection(
    @Body() input: CreateAcademicSectionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.createSection(input, user);
  }

  @Get('academic/sections/:sectionId/teachers')
  @Roles('system_admin', 'department_head')
  @Header('Cache-Control', 'no-store')
  listTeachers(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @Query() query: AcademicCatalogQueryDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.listSectionTeachers(sectionId, query, user);
  }

  @Post('academic/sections/:sectionId/teachers')
  @Roles('system_admin', 'department_head')
  assignTeacher(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @Body() input: AssignTeacherDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.assignTeacher(sectionId, input.teacherUserId, user);
  }

  @Delete('academic/sections/:sectionId/teachers/:teacherUserId')
  @Roles('system_admin', 'department_head')
  unassignTeacher(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @Param('teacherUserId', new ParseUUIDPipe({ version: '4' })) teacherUserId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.unassignTeacher(sectionId, teacherUserId, user);
  }

  @Get('academic/sections/:sectionId/students')
  @Roles('system_admin', 'department_head', 'instructor')
  @Header('Cache-Control', 'no-store')
  listEnrolledStudents(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @Query() query: AcademicCatalogQueryDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.listEnrolledStudents(sectionId, query, user);
  }

  @Post('academic/sections/:sectionId/enrollments')
  @Roles('system_admin', 'department_head')
  enrollStudent(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @Body() input: AdminEnrollStudentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.adminEnrollStudent(sectionId, input.studentUserId, user);
  }

  @Patch('academic/sections/:sectionId')
  @Roles('system_admin', 'department_head')
  updateSection(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @Body() input: UpdateAcademicSectionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.updateSection(sectionId, input, user);
  }

  @Post('academic/sections/:sectionId/open')
  @Roles('system_admin', 'department_head')
  openSection(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.setSectionStatus(sectionId, 'open', user);
  }

  @Post('academic/sections/:sectionId/close')
  @Roles('system_admin', 'department_head')
  closeSection(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.setSectionStatus(sectionId, 'closed', user);
  }

  @Get('academic/sections/:sectionId')
  @Roles('system_admin', 'department_head', 'instructor', 'student')
  @Header('Cache-Control', 'no-store')
  getSection(
    @Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.getSection(sectionId, user);
  }

  @Delete('academic/enrollments/:enrollmentId')
  @Roles('system_admin', 'department_head')
  cancelEnrollment(
    @Param('enrollmentId', new ParseUUIDPipe({ version: '4' })) enrollmentId: string,
    @Body() input: CancelEnrollmentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.adminCancelEnrollment(enrollmentId, input.reason, user);
  }

  @Get('students/me/academic-enrollments')
  @Roles('student')
  @Header('Cache-Control', 'no-store')
  listMyEnrollments(
    @Query() query: AcademicCatalogQueryDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.listMyEnrollments(query, user);
  }

  @Post('students/me/academic-enrollments')
  @Roles('student')
  enrollMyself(@Body() input: StudentEnrollDto, @CurrentUser() user: UserEntity) {
    return this.operations.enrollStudent(input.sectionId, user);
  }

  @Delete('students/me/academic-enrollments/:enrollmentId')
  @Roles('student')
  cancelMyEnrollment(
    @Param('enrollmentId', new ParseUUIDPipe({ version: '4' })) enrollmentId: string,
    @Body() input: CancelEnrollmentDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.operations.cancelMyEnrollment(enrollmentId, input?.reason, user);
  }
}
