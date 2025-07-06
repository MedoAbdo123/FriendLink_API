import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from 'src/guard/authGuard.guard';
import { PostDto } from './dto/post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { UpdatePostDto } from './dto/updatePost.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  
  async AddPost(
    @Body() postDto: PostDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      postDto.image = file.filename;
    }
    return await this.postService.AddPost(postDto, req.user);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
  ) {
    return await this.postService.updatePost(updatePostDto, id);
  }

  @Get('allPosts')
  async getAllPosts(@Query('skip') skip = '0', @Query('limit') limit = '10') {
    return this.postService.getPosts(parseInt(skip), parseInt(limit));
  }

  @Delete('delete/:postId')
  async deletePost(@Param('postId') postId: string) {
    return await this.postService.deletePost(postId);
  }

  @Post('like/:postId')
  @UseGuards(AuthGuard)
  async likeAndDisLike(@Param('postId') postId: string, @Req() req) {
    return await this.postService.likeAndDisLike(postId, req.user);
  }

  @Get(':userId')
  async getPostByUsernameOrUserId(@Param('userId') userId: string) {
    return await this.postService.findPostByUsernameOrUserId(userId);
  }
}
