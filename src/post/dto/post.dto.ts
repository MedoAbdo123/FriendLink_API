import { IsOptional, IsString, IsUrl } from 'class-validator';

export class PostDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  image: string;
}
