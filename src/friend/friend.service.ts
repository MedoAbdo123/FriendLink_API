import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Friend, FriendshipStatus } from './schema/friend.schema';
import { Model } from 'mongoose';
import { FriendDto } from './dto/friend.dto';
import { User } from 'src/user/schema/user.schema';
import { ChatRoom } from 'src/ChatRoom/schema/chat-room.schema';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(Friend.name) private FriendModel: Model<Friend>,
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(ChatRoom.name) private ChatRoomModel: Model<ChatRoom>,
  ) {}

  async sendRequest(friendDto: FriendDto, user: any) {
    const { receiverId } = friendDto;

    if (user.id === receiverId.toString()) {
      throw new HttpException('Cannot send friend request to yourself', 400);
    }

    const existingRequest = await this.FriendModel.findOne({
      $or: [
        { senderId: user.id, receiverId: receiverId },
        { senderId: receiverId, receiverId: user.id },
      ],
    });

    if (existingRequest) {
      throw new HttpException('Friend request already exists', 409);
    }

    const receiverExists = await this.UserModel.findById(receiverId);
    if (!receiverExists) {
      throw new HttpException('Receiver not found', 404);
    }

    const friendRequest = await this.FriendModel.create({
      senderId: user.id,
      receiverId: receiverId,
      status: FriendshipStatus.PENDING,
    });

    return {
      data: {
        message: 'Friend request sent successfully',
        request: friendRequest,
      },
    };
  }

  async getRequests(user: any) {
    const requsets = await this.FriendModel.find({ receiverId: user.id })
      .populate('senderId', 'name username email avatar')
      .lean();
    if (requsets.length == 0) {
      return {
        message: 'There are no requests',
        requsets: [],
      };
    }
    return requsets;
  }

  async acceptTheRequest(requestId: string) {
    const findRequest = await this.FriendModel.findById(requestId);
    if (!findRequest) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    if (findRequest?.status === FriendshipStatus.ACCEPTED) {
      throw new HttpException('The request has been accepted', 409);
    }

    const request = await this.FriendModel.findByIdAndUpdate(
      requestId,
      {
        status: FriendshipStatus.ACCEPTED,
      },
      { new: true },
    );

    const roomId = this.generateRoomId(
      findRequest.senderId.toString(),
      findRequest.receiverId.toString(),
    );

    const existingRoom = await this.ChatRoomModel.findOne({ roomId });

    if (!existingRoom) {
      const chatRoom = new this.ChatRoomModel({
        roomId: roomId,
        participants: [findRequest.senderId, findRequest.receiverId],
      });

      await chatRoom.save();
    }

    return {
      friendship: request,
      chatRoom: {
        roomId: roomId,
        message: 'Chat room created successfully',
      },
    };
  }

  private generateRoomId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `room_${sortedIds[0]}_${sortedIds[1]}`;
  }

  async cancelTheRequest(requestId: string) {
    const findRequest = await this.FriendModel.findById(requestId);
    if (!findRequest) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    if (
      findRequest.status == FriendshipStatus.ACCEPTED ||
      findRequest?.status == FriendshipStatus.PENDING
    ) {
      await findRequest.deleteOne();
    }

    return findRequest;
  }
}
