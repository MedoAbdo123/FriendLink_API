import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { FriendModule } from './friend/friend.module';
import { ChatRoomModule } from './ChatRoom/chat-room.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
    }),
    PostModule,
    CommentModule,
    FriendModule,
    ChatRoomModule,
    MessagesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
