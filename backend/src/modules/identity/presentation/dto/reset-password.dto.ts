import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Reset token must be a string' })
  @IsNotEmpty({ message: 'Reset token cannot be empty' })
  token!: string;

  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password cannot be empty' })
  password!: string;
}
