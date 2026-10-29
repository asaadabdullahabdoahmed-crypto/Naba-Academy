import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { AcademicCatalogService } from './application/academic-catalog.service';
import {
  ACADEMIC_ENTITIES,
} from './infrastructure/persistence/academic-catalog.entity';
import { AcademicCatalogController } from './presentation/controllers/academic-catalog.controller';
import { StudentAcademicProfileController } from './student-academic-profile.controller';

@Module({
  imports: [
    ConfigModule,
    IdentityModule,
    TypeOrmModule.forFeature(ACADEMIC_ENTITIES),
  ],
  controllers: [AcademicCatalogController, StudentAcademicProfileController],
  providers: [AcademicCatalogService],
})
export class AcademicModule {}
