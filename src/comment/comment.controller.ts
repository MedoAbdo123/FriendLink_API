import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '../guard/authGuard.guard';
import { CommentDto } from './dto/comment.dto';
import { UpdateCommentDto } from './dto/updateComment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async addComment(@Body() commentDto: CommentDto, @Req() req) {
    return await this.commentService.AddComment(commentDto, req.user);
  }

  @Get(':postId')
  async getComments(@Param('postId') postId: string) {
    return await this.commentService.getComments(postId);
  }

  @Patch(':commentsId')
  @UseGuards(AuthGuard)
  async updateComment(
    @Body() updateCommentDto: UpdateCommentDto,
    @Param('commentsId') commentsId: string,
    @Req() req,
  ) {
    return await this.commentService.updateComment(
      updateCommentDto,
      commentsId,
      req.user.id,
    );
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  async deleteComment(@Param('commentId') commentsId: string, @Req() req) {
    return await this.commentService.deleteComment(commentsId, req.user.id);
  }
}
