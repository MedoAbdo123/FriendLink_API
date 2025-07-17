import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const logger = new Logger('ChatGateway');
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleConnection(client: Socket) {
    logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    logger.log(`Client ${client.id} joined room ${data.roomId}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody()
    data: { roomId: string; senderId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    logger.log(`New message from ${data.senderId}: ${data.message}`);
    client.to(data.roomId).emit('receiveMessage', data);
  }
}
