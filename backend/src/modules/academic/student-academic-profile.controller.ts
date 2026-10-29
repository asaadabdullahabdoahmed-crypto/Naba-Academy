import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../identity/presentation/decorators/current-user.decorator';
import { Roles } from '../identity/presentation/decorators/roles.decorator';
import { SessionAuthGuard } from '../identity/presentation/guards/session-auth.guard';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';
import { UserEntity } from '../identity/infrastructure/persistence/entities/user.entity';

export interface StudentAcademicProfileResponse {
  departmentId: string | null;
  departmentAr: string | null;
  departmentEn: string | null;
  collegeAr: string | null;
  collegeEn: string | null;
}

@Controller('students')
export class StudentAcademicProfileController {
  @Get('me/academic-profile')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles('student')
  @Header('Cache-Control', 'no-store')
  getMyAcademicProfile(
    @CurrentUser() user: UserEntity,
  ): StudentAcademicProfileResponse {
    return {
      departmentId: user.departmentId,
      departmentAr: user.departmentAr,
      departmentEn: user.departmentEn,
      collegeAr: user.collegeAr,
      collegeEn: user.collegeEn,
    };
  }
}
