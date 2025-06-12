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
import { AuthGuard } from 'src/guard/authGuard.guard';
import { UserSchema } from 'src/user/schema/user.schema';

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
}
