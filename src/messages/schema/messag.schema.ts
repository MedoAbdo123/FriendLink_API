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
}

export const MessageSchema = SchemaFactory.createForClass(Message);
