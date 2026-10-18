import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from './infrastructure/persistence/entities/permission.entity';
import { RolePermissionEntity } from './infrastructure/persistence/entities/role-permission.entity';
import { UserRoleAssignmentEntity } from './infrastructure/persistence/entities/user-role-assignment.entity';
import { UserSessionEntity } from './infrastructure/persistence/entities/user-session.entity';
import { EmailVerificationTokenEntity } from './infrastructure/persistence/entities/email-verification-token.entity';
import { PasswordResetTokenEntity } from './infrastructure/persistence/entities/password-reset-token.entity';
import { UserAccountStatusEventEntity } from './infrastructure/persistence/entities/user-account-status-event.entity';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { Argon2PasswordHasherService } from './infrastructure/security/argon2-password-hasher.service';
import { SecureTokenService } from './infrastructure/security/secure-token.service';
import { EMAIL_SENDER } from './application/ports/email-sender.port';
import { NodemailerEmailSenderService } from './infrastructure/mail/nodemailer-email-sender.service';
import { RegistrationService } from './application/services/registration.service';
import { EmailVerificationService } from './application/services/email-verification.service';
import { AuthenticationService } from './application/services/authentication.service';
import { SessionService } from './application/services/session.service';
import { PasswordResetService } from './application/services/password-reset.service';
import { IdentityRateLimiterService } from './infrastructure/security/rate-limiter.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { SessionAuthGuard } from './presentation/guards/session-auth.guard';
import { CsrfGuard } from './presentation/guards/csrf.guard';
import { OriginRefererGuard } from './presentation/guards/origin-referer.guard';
import { RateLimiterGuard } from './presentation/guards/rate-limiter.guard';

export const IDENTITY_ENTITIES = [
  UserEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  UserRoleAssignmentEntity,
  UserSessionEntity,
  EmailVerificationTokenEntity,
  PasswordResetTokenEntity,
  UserAccountStatusEventEntity,
];

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature(IDENTITY_ENTITIES),
  ],
  controllers: [AuthController],
  providers: [
    Argon2PasswordHasherService,
    {
      provide: PASSWORD_HASHER,
      useExisting: Argon2PasswordHasherService,
    },
    SecureTokenService,
    NodemailerEmailSenderService,
    {
      provide: EMAIL_SENDER,
      useExisting: NodemailerEmailSenderService,
    },
    RegistrationService,
    EmailVerificationService,
    AuthenticationService,
    SessionService,
    PasswordResetService,
    IdentityRateLimiterService,
    SessionAuthGuard,
    CsrfGuard,
    OriginRefererGuard,
    RateLimiterGuard,
  ],
  exports: [
    TypeOrmModule,
    PASSWORD_HASHER,
    Argon2PasswordHasherService,
    SecureTokenService,
    EMAIL_SENDER,
    NodemailerEmailSenderService,
    RegistrationService,
    EmailVerificationService,
    AuthenticationService,
    SessionService,
    PasswordResetService,
    IdentityRateLimiterService,
    SessionAuthGuard,
    CsrfGuard,
    OriginRefererGuard,
    RateLimiterGuard,
  ],
})
export class IdentityModule {}

