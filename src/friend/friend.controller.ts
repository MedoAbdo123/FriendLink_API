import { FriendDto } from './dto/friend.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { AuthGuard } from '../guard/authGuard.guard';
import { UserSchema } from '../user/schema/user.schema';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post('')
  @UseGuards(AuthGuard)
  async sendRequest(@Body() friendDto: FriendDto, @Req() req) {
    return await this.friendService.sendRequest(friendDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getRequests(@Req() req) {
    return await this.friendService.getRequests(req.user);
  }

  @Patch(':requestId')
  @UseGuards(AuthGuard)
  async acceptTheRequest(@Param('requestId') requestId: string) {
    return await this.friendService.acceptTheRequest(requestId);
  }

  @Delete(':requestId')
  @UseGuards(AuthGuard)
  async cancelTheRequest(@Param('requestId') requestId: string) {
    return await this.friendService.cancelTheRequest(requestId);
  }

  @Get('myFriends')
  @UseGuards(AuthGuard)
  async getFriends(@Req() req) {
    return await this.friendService.getFriends(req.user.id);
  }

  @Get('pending')
  @UseGuards(AuthGuard)
  async getRequestsPending(@Req() req) {
    return this.friendService.getRequestsPending(req.user.id);
  }

  @Get('getStatus/:receiverId')
  @UseGuards(AuthGuard)
  async getStatusRequestByUsername(@Param("receiverId") receiverId: string, @Req() req){
    return await this.friendService.getStatusRequestByUsername(req.user.id,receiverId)
  }
}
