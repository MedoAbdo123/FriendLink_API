import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  roomId: string;

  @Prop({ type: String })
  message?: string;

  @Prop({ type: String })
  photo?: string;

  @Prop({
    type: {
      title: { type: String },
      description: { type: String },
      image: { type: String },
      url: { type: String },
    },
    default: null,
  })
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
    url: string;
  } | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
