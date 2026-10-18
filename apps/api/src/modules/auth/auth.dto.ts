import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'founder@startup.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure@Pass1' })
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one digit' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  password: string;

  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'KiranaPay' })
  @IsOptional()
  @IsString()
  companyName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'founder@startup.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure@Pass1' })
  @IsString()
  @MinLength(1)
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one digit' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  newPassword: string;
}

export class RequestResetDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
