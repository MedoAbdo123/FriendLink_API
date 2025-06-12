import { IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @IsString()
  content: string;

  @IsString()
  @IsNotEmpty()
  postId: string
}
