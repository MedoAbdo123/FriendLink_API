import { AuthGuard } from './../guard/authGuard.guard';
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
import { LoginUserDto } from './dto/loginUser.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(
    @Body() userDto: UserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.registerUser(userDto, file);
  }

  @Post('login')
  async loginUser(@Body() login: LoginUserDto) {
    return await this.userService.loginUser(login);
  }

  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('avatar'),
  )
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.updateUser(updateUserDto, id, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllUsers(@Req() req) {
    return await this.userService.getAllUsers(req.user.id);
  }
}
