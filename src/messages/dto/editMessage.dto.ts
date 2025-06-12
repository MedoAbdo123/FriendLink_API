import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsOptional()
  message: string;
}
