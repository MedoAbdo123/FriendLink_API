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
import { AuthGuard } from 'src/guard/authGuard.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { EditMessageDto } from './dto/editMessage.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async sendMessage(
    @Body() messageDto: MessageDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      messageDto.photo = file.filename;
    }
    return await this.messagesService.sendMessage(messageDto, req.user);
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
    return await this.messagesService.deleteMessage(messageId);
  }
}
