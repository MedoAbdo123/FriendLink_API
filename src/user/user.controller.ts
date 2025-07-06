import { UpdateUserDto } from './dto/updateUser.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/registerUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthGuard } from 'src/guard/authGuard.guard';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async createUser(
    @Body() userDto: UserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      userDto.avatar = file.filename;
    }

    return await this.userService.registerUser(userDto);
  }

  @Post('login')
  async loginUser(@Body() login: LoginUserDto) {
    return await this.userService.loginUser(login);
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateUserDto.avatar = file.filename;
    }
    return await this.userService.updateUser(updateUserDto, id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllUsers(@Req() req) {
    return await this.userService.getAllUsers(req.user.id);
  }
}
