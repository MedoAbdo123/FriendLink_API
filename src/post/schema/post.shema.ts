import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop()
  title?: string;

  @Prop()
  content?: string;

  @Prop()
  image?: string;

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedUsers: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  commentsNumber: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
  comments: Types.ObjectId[];

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
