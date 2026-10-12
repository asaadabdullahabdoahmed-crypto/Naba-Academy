import { IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email!: string;

  @IsOptional()
  @IsIn(['ar', 'en'], {
    message: 'Locale must be either "ar" or "en"',
  })
  locale?: 'ar' | 'en';
}
