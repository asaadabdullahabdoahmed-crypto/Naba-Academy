import { Controller, Get, Header, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../identity/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../identity/presentation/guards/roles.guard';
import { SessionAuthGuard } from '../../../identity/presentation/guards/session-auth.guard';
import { TeachingCatalogService } from '../../application/teaching-catalog.service';
import { CourseCatalogQueryDto, CourseOfferingQueryDto, TeachingCatalogQueryDto } from '../dto/teaching-catalog-query.dto';

/** Reference reads only. This role gate grants no access to private academic records. */
@Controller('academic')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles('system_admin', 'department_head', 'instructor')
export class TeachingCatalogController {
  constructor(private readonly catalog: TeachingCatalogService) {}

  @Get('courses')
  @Header('Cache-Control', 'no-store')
  listCourses(@Query() query: CourseCatalogQueryDto) {
    return this.catalog.listCourses(query);
  }

  @Get('courses/:courseId')
  @Header('Cache-Control', 'no-store')
  getCourse(@Param('courseId', new ParseUUIDPipe({ version: '4' })) courseId: string) {
    return this.catalog.getCourse(courseId);
  }

  @Get('courses/:courseId/offerings')
  @Header('Cache-Control', 'no-store')
  listCourseOfferings(
    @Param('courseId', new ParseUUIDPipe({ version: '4' })) courseId: string,
    @Query() query: CourseOfferingQueryDto,
  ) {
    return this.catalog.listCourseOfferings(courseId, query);
  }

  @Get('terms')
  @Header('Cache-Control', 'no-store')
  listTerms(@Query() query: TeachingCatalogQueryDto) {
    return this.catalog.listTerms(query);
  }

  @Get('terms/:termId')
  @Header('Cache-Control', 'no-store')
  getTerm(@Param('termId', new ParseUUIDPipe({ version: '4' })) termId: string) {
    return this.catalog.getTerm(termId);
  }
}
