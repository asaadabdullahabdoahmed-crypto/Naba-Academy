import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDENTITY_ENTITIES, IdentityModule } from '../identity/identity.module';
import { AcademicCatalogService } from './application/academic-catalog.service';
import { AcademicAuthorizationService } from './application/academic-authorization.service';
import { ACADEMIC_ENTITIES } from './infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogController } from './presentation/controllers/academic-catalog.controller';
import { StudentAcademicProfileController } from './student-academic-profile.controller';
import { TeachingCatalogService } from './application/teaching-catalog.service';
import { TeachingCatalogController } from './presentation/controllers/teaching-catalog.controller';

@Module({
  imports: [
    ConfigModule,
    IdentityModule,
    TypeOrmModule.forFeature([...ACADEMIC_ENTITIES, ...IDENTITY_ENTITIES]),
  ],
  controllers: [AcademicCatalogController, StudentAcademicProfileController, TeachingCatalogController],
  providers: [AcademicCatalogService, AcademicAuthorizationService, TeachingCatalogService],
})
export class AcademicModule {}
