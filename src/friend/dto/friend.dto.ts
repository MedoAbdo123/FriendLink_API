import { FriendshipStatus } from './../schema/friend.schema';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

import { IsObjectId } from 'src/validators/isObjectId.validator';

export class FriendDto {
  @IsNotEmpty()
  @IsObjectId()
  @Transform(({ value }) => new Types.ObjectId(value))
  receiverId: Types.ObjectId;
}
