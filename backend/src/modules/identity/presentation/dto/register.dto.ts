import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'National ID must be a string' })
  @IsNotEmpty({ message: 'National ID cannot be empty' })
  @MinLength(10, { message: 'National ID must be at least 10 characters' })
  @MaxLength(20, { message: 'National ID cannot exceed 20 characters' })
  nationalId!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Full Arabic name must be a string' })
  @IsNotEmpty({ message: 'Full Arabic name cannot be empty' })
  @MaxLength(255, { message: 'Full Arabic name cannot exceed 255 characters' })
  fullNameAr!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Full English name must be a string' })
  @IsNotEmpty({ message: 'Full English name cannot be empty' })
  @MaxLength(255, { message: 'Full English name cannot exceed 255 characters' })
  fullNameEn!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @MaxLength(30, { message: 'Phone number cannot exceed 30 characters' })
  phone?: string;
}
