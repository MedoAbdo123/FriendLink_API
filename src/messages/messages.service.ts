import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schema/messag.schema';
import { MessageDto } from './dto/message.dto';
import { MessagesGateway } from './gateway/gateway';
import { ChatRoom } from 'src/ChatRoom/schema/chat-room.schema';
import { EditMessageDto } from './dto/editMessage.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private MessageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private ChatRoomModel: Model<ChatRoom>,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async sendMessage(messageDto: MessageDto, user: any): Promise<Message> {
    const { roomId, message } = messageDto;

    const room = await this.ChatRoomModel.findOne({ roomId: roomId });
    if (!room) {
      throw new HttpException('Invalid room id', HttpStatus.NOT_FOUND);
    }

    const findUserId = await this.ChatRoomModel.findOne({
      participants: user.id,
    });
    if (!findUserId) {
      throw new HttpException(
        'You are not allowed to send messages in this room.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { photo } = messageDto;
    let photoUrl: string | undefined;
    if (photo) {
      const baseUrl = 'http://localhost:3000';
      photoUrl = `${baseUrl}/uploads/${photo}`;
    }

    const newMessage = new this.MessageModel({
      senderId: user.id,
      roomId: roomId,
      message: message,
      photo: photoUrl,
    });

    const savedMessage = await newMessage.save();
    this.messagesGateway.emitNewMessage(roomId, savedMessage);
    return savedMessage;
  }

  async getMessage(roomId: string) {
    const room = await this.ChatRoomModel.findOne({
      roomId: roomId.toString(),
    });
    if (!room) {
      throw new HttpException('Invalid room id', HttpStatus.NOT_FOUND);
    }

    const messages = await this.MessageModel.find({
      roomId: roomId.toString(),
    }).populate('senderId', 'name username avatar');
    return messages;
  }

  async editMessage(messageId: string, editMessageDto: EditMessageDto) {
    const message = await this.MessageModel.findByIdAndUpdate(
      messageId,
      editMessageDto,
      { new: true },
    );
    return message;
  }

  async deleteMessage(messageId: string) {
    const message = await this.MessageModel.findById(messageId);
    if (!message) {
      throw new HttpException('Invalid message id', HttpStatus.NOT_FOUND);
    }
    await message.deleteOne()
    return message
  }
}
