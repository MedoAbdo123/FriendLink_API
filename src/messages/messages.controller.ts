import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/message.dto';
import { AuthGuard } from '../guard/authGuard.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { EditMessageDto } from './dto/editMessage.dto';
import { MessagesGateway } from './gateway/gateway';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway, // ← inject the gateway
  ) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  @Post()
  sendMessage(
    @UploadedFile() file: Express.Multer.File,
    @Body() messageDto: MessageDto,
    @Req() req,
  ) {
    return this.messagesService.sendMessage(messageDto, req.user, file);
  }

  @Get(':roomId')
  @UseGuards(AuthGuard)
  async getMessage(@Param('roomId') roomId) {
    return await this.messagesService.getMessage(roomId);
  }
  
  @Patch(':messageId')
  @UseGuards(AuthGuard)
  async updateMessage(
    @Body() editMessageDto: EditMessageDto,
    @Param('messageId') messageId: string,
  ) {
    return await this.messagesService.editMessage(messageId, editMessageDto);
  }

  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    const deletedMsg = await this.messagesService.deleteMessage(messageId);
    this.messagesGateway.server
      .to(deletedMsg.roomId)
      .emit('messageDeleted', messageId);
    return { success: true };
  }
}
