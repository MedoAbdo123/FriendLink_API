import { IsOptional, IsString } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsOptional()
  message: string;
}
