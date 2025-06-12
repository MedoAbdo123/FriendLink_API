import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  avatar: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;
}
