import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { StudentAcademicProfileController } from './student-academic-profile.controller';

@Module({
  imports: [IdentityModule],
  controllers: [StudentAcademicProfileController],
})
export class AcademicModule {}
