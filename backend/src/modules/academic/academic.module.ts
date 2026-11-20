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
import { ACADEMIC_OPERATIONS_ENTITIES } from './infrastructure/persistence/academic-operations.entity';
import { AcademicOperationsService } from './application/academic-operations.service';
import { AcademicOperationsController } from './presentation/controllers/academic-operations.controller';

@Module({
  imports: [
    ConfigModule,
    IdentityModule,
    TypeOrmModule.forFeature([...ACADEMIC_ENTITIES, ...ACADEMIC_OPERATIONS_ENTITIES, ...IDENTITY_ENTITIES]),
  ],
  controllers: [AcademicCatalogController, StudentAcademicProfileController, TeachingCatalogController, AcademicOperationsController],
  providers: [AcademicCatalogService, AcademicAuthorizationService, TeachingCatalogService, AcademicOperationsService],
})
export class AcademicModule {}
