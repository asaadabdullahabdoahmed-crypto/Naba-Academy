import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { AcademicCatalogService } from './application/academic-catalog.service';
import { CurrentUser } from '../identity/presentation/decorators/current-user.decorator';
import { Roles } from '../identity/presentation/decorators/roles.decorator';
import { SessionAuthGuard } from '../identity/presentation/guards/session-auth.guard';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';
import { AcademicAuthorizationService } from './application/academic-authorization.service';
import { AcademicCatalogQueryDto } from './presentation/dto/academic-catalog-query.dto';

export interface StudentAcademicProfileResponse {
  departmentId: string | null;
  departmentAr: string | null;
  departmentEn: string | null;
  collegeAr: string | null;
  collegeEn: string | null;
}

@Controller('students')
export class StudentAcademicProfileController {
  constructor(
    private readonly academicCatalog: AcademicCatalogService,
    private readonly academicAuthorization: AcademicAuthorizationService,
  ) {}

  @Get('me/academic-profile')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('student')
  @Header('Cache-Control', 'no-store')
  async getMyAcademicProfile(
    @CurrentUser() user: UserEntity,
  ): Promise<StudentAcademicProfileResponse> {
    await this.academicAuthorization.assertStudentOwns(user, user.id);
    return {
      departmentId: user.departmentId,
      departmentAr: user.departmentAr,
      departmentEn: user.departmentEn,
      collegeAr: user.collegeAr,
      collegeEn: user.collegeEn,
    };
  }

  @Get('me/academic-placement')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('student')
  @Header('Cache-Control', 'no-store')
  async getMyAcademicPlacement(@CurrentUser() user: UserEntity) {
    await this.academicAuthorization.assertStudentOwns(user, user.id);
    return this.academicCatalog.getCurrentPlacement(user.id);
  }

  @Get('me/academic-placement-history')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('student')
  @Header('Cache-Control', 'no-store')
  async getMyRecordedAcademicPlacementHistory(
    @CurrentUser() user: UserEntity,
    @Query() query: AcademicCatalogQueryDto,
  ) {
    await this.academicAuthorization.assertStudentOwns(user, user.id);
    return this.academicCatalog.listMyPlacementHistory(user.id, query);
  }
}
