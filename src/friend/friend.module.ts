import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Friend, FriendSchema } from './schema/friend.schema';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { ChatRoom, ChatRoomSchema } from 'src/ChatRoom/schema/chat-room.schema';
import { Message, MessageSchema } from 'src/messages/schema/messag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Friend.name,
        schema: FriendSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ChatRoom.name,
        schema: ChatRoomSchema,
      },
          {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
