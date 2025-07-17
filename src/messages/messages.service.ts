import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schema/messag.schema';
import { MessageDto } from './dto/message.dto';
import { MessagesGateway } from './gateway/gateway';
import { ChatRoom } from '../ChatRoom/schema/chat-room.schema';
import { EditMessageDto } from './dto/editMessage.dto';
const ogs = require('open-graph-scraper');

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private MessageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private ChatRoomModel: Model<ChatRoom>,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async sendMessage(messageDto: MessageDto, user: any): Promise<Message> {
    const { roomId, message, photo } = messageDto;

    const room = await this.ChatRoomModel.findOne({ roomId: roomId });
    if (!room) {
      throw new HttpException('Invalid room id', HttpStatus.NOT_FOUND);
    }

    const findUserInRoom = await this.ChatRoomModel.findOne({
      participants: user.id,
    });
    if (!findUserInRoom) {
      throw new HttpException(
        'You are not allowed to send messages in this room.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let linkPreview: {
      title?: string;
      description?: string;
      image?: string;
      url: string;
    } | null = null;

    const urlMatch = message?.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      try {
        const { error, result } = await ogs({
          url: urlMatch[0],
          headers: {
            'user-agent': 'Mozilla/5.0',
          },
          timeout: 10000,
        });

        if (!error && result) {
          linkPreview = {
            title: result.ogTitle || '',
            description: result.ogDescription || '',
            image: Array.isArray(result.ogImage)
              ? result.ogImage[0]?.url || ''
              : result.ogImage?.url || '',
            url: result.ogUrl || urlMatch[0],
          };
        }
      } catch (err) {
        console.log('OpenGraph error:', err);
      }
    }

    let photoUrl: string | undefined;
    if (photo) {
      const baseUrl = 'https://friendlink-api.onrender.com';
      photoUrl = `${baseUrl}/uploads/${photo}`;
    }

    const newMessage = new this.MessageModel({
      senderId: user.id,
      roomId,
      message,
      photo: photoUrl,
      linkPreview,
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await savedMessage.populate(
      'senderId',
      'name username avatar',
    );

    this.messagesGateway.emitNewMessage(roomId, populatedMessage);
    return populatedMessage;
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
    { ...editMessageDto, edited: 'edited' },
      { new: true },
    ).populate('senderId', 'name username avatar');
    return message;
  }

  async deleteMessage(messageId: string) {
    const message = await this.MessageModel.findById(messageId);
    if (!message) {
      throw new HttpException('Invalid message id', HttpStatus.NOT_FOUND);
    }
    await message.deleteOne();
    return message;
  }
}
