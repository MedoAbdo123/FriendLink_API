import { forwardRef, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  constructor(
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: string;
    },
  ) {
    this.server.emit('newMessage', data);
    console.log(`Message sent to ${data.roomId}: ${data.message}`);
  }

  emitNewMessage(roomId: string, message: any) {
    this.server.to(roomId).emit('onMessage', message);
  }

  @SubscribeMessage('editMessage')
  handleEditMessage(@MessageBody() message: any) {
    this.server.to(message.roomId).emit('messageEdited', message);
  }

  // gateway/messages.gateway.ts
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; roomId: string },
  ) {
    const deleted = await this.messagesService.deleteMessage(data.messageId);
    // broadcast only to clients in that room:
    this.server.to(data.roomId).emit('messageDeleted', data.messageId);
  }
}
