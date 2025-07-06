import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schema/comment.schema';
import { Model, Types } from 'mongoose';
import { Post } from 'src/post/schema/post.shema';
import { CommentDto } from './dto/comment.dto';
import { UpdateCommentDto } from './dto/updateComment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
    @InjectModel(Post.name) private PostModel: Model<Post>,
  ) {}

  async AddComment(commentDto: CommentDto, user: any) {
    const { content, postId } = commentDto;

    if (!Types.ObjectId.isValid(postId)) {
      throw new HttpException('Invalid post id', HttpStatus.BAD_REQUEST);
    }

    const comment = new this.CommentModel({
      content,
      user: user.id,
      post: postId,
    });
    await comment.save();

    await this.PostModel.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
    });

    const populatedComment = await this.CommentModel.findById(
      comment._id,
    ).populate('user', 'name avatar');
    return {
      message: 'Comment added successfully',
      comment: populatedComment,
    };
  }

  async getComments(postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new HttpException('Invalid post id', HttpStatus.BAD_REQUEST);
    }
    const postWithComments = await this.PostModel.findById(postId)
      .populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: 'name username avatar',
        },
      })
      .lean();
    return {
      data: postWithComments,
    };
  }

  async updateComment(
    updateCommentDto: UpdateCommentDto,
    commentId: string,
    user: any,
  ) {
    const comment = await this.CommentModel.findById(commentId);

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.user.toString() != user.toString()) {
      throw new HttpException(
        'You are not authorized to edit this comment',
        HttpStatus.FORBIDDEN,
      );
    }

    const newComment = await this.CommentModel.findByIdAndUpdate(
      commentId,
      { ...updateCommentDto, edited: 'edited' },
      { new: true },
    ).populate('user', 'name avatar');

    return {
      comment: newComment,
    };
  }

  async deleteComment(commentId: string, user: any) {
    const comment = await this.CommentModel.findById(commentId);

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.user.toString() !== user.toString()) {
      throw new HttpException(
        'You do not have the right to delete this comment.',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.CommentModel.findByIdAndDelete(commentId);

    return { message: 'Comment deleted successfully' };
  }
}
