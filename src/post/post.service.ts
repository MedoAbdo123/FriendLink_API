import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schema/post.shema';
import { Model, Types } from 'mongoose';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { Comment } from '../comment/schema/comment.schema';
import { User } from '../user/schema/user.schema';
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const updateLocale = require('dayjs/plugin/updateLocale');

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: (input: string) => {
      const value = parseInt(input);
      if (input.includes('d')) {
        if (value >= 7 && value < 30) {
          const weeks = Math.floor(value / 7);
          return `${weeks}w ago`;
        }
        return `${value}d ago`;
      }
      return `${input} ago`;
    },
    s: 'now',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy',
  },
});

export type PostDocumentWithTimestamps = Post &
  Document & { createdAt: Date; updatedAt: Date };

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<Post>,
    @InjectModel(Comment.name) private CommentModel: Model<Comment>,
    @InjectModel(User.name) private UserModel: Model<User>,
  ) {}

  async AddPost(postDto: PostDto, user: any) {
    const { image } = postDto;
    let avatarUrl: string | undefined;
    if (image) {
      const baseUrl = 'https://friendlink-api.onrender.com/';
      avatarUrl = `${baseUrl}/uploads/${image}`;
    }
    const newPost = await this.PostModel.create({
      ...postDto,
      username: user.username,
      image: avatarUrl,
      user: user.id,
    });
    return {
      data: {
        message: 'Created post successfully',
        post: newPost,
      },
    };
  }

  async updatePost(updatePostDto: UpdatePostDto, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }

    const post = await this.PostModel.findByIdAndUpdate(id, updatePostDto, {
      new: true,
    });

    return {
      data: {
        message: 'Updated post successfully',
        post: post,
      },
    };
  }

  async deletePost(postId: string) {
    if (!Types.ObjectId.isValid(postId)) {
      throw new HttpException('Post Not Found', HttpStatus.NOT_FOUND);
    }
    await this.PostModel.findByIdAndDelete(postId);
    return { message: 'Deleted post successfully' };
  }

  async getPosts(skip = 0, limit = 10) {
    const posts = await this.PostModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username avatar')
      .lean<PostDocumentWithTimestamps[]>();

    const postsWithTimeAgo = await Promise.all(
      posts.map(async (post) => {
        const existingComments = await this.CommentModel.find({
          _id: { $in: post.comments },
        }).select('_id');

        const existingCommentIds = existingComments.map((c) =>
          c._id.toString(),
        );

        return {
          ...post,
          timeAgo: dayjs(post.createdAt).fromNow(),
          commentsNumber: existingCommentIds.length,
          comments: existingCommentIds,
        };
      }),
    );

    return {
      data: postsWithTimeAgo,
    };
  }

  async findPostByUsernameOrUserId(userId: string) {
    const postsUser = await this.PostModel.find({
      $or: [{ username: userId }, { user: userId }],
    })
      .populate('user', 'name username avatar')
      .lean<PostDocumentWithTimestamps[]>();

    if (postsUser.length == 0) {
      const userData = await this.UserModel.findOne({
        username: userId,
      }).select('-password');
      return userData;
    }

    const postsWithCommentCount = await Promise.all(
      postsUser.map(async (postUser) => {
        const existingComments = await this.CommentModel.find({
          _id: { $in: postUser.comments },
        }).select('_id');

        const existingCommentIds = existingComments.map((c) =>
          c._id.toString(),
        );

        return {
          ...postUser,
          timeAgo: dayjs(postUser.createdAt).fromNow(),
          commentsNumber: existingCommentIds.length,
          comments: existingCommentIds,
        };
      }),
    );

    return postsWithCommentCount;
  }

  async likeAndDisLike(postId: string, user: any) {
    const post = await this.PostModel.findById(postId);
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }

    if (post.likedUsers.includes(user.id)) {
      post.likes -= 1;
      const index = post.likedUsers.indexOf(user.id);
      post.likedUsers.splice(index, 1);
    } else {
      post.likes += 1;
      post.likedUsers.push(user.id);
    }

    await post.save();
    return post;
  }
}
