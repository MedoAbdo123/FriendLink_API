import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message, MessageSchema } from './schema/messag.schema';
import { MessagesGateway } from './gateway/gateway';
import { ChatRoom, ChatRoomSchema } from 'src/ChatRoom/schema/chat-room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService,{provide: MessagesGateway, useClass: MessagesGateway}, MessagesGateway],
  exports: [MessagesService]
})
export class MessagesModule {}
