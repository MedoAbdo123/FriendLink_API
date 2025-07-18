import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { Friend, FriendSchema } from '../friend/schema/friend.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Friend.name,
        schema: FriendSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
})
export class UserModule {}
