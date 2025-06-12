import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class ChatRoom {
  @Prop({ type: String, required: true, unique: true })
  roomId: Types.ObjectId[];

  @Prop([{ type: Types.ObjectId, ref: 'User', required: true }])
  participants: string;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
