import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  CANCEL = 'cancel',
}

@Schema({
  timestamps: true,
  collection: 'friendships',
})
export class Friend extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  senderId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  receiverId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(FriendshipStatus),
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
FriendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
