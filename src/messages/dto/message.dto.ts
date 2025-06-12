import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsOptional()
  message: string;

  @IsUrl()
  @IsString()
  @IsOptional()
  photo: string;
}
