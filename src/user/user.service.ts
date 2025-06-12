import { UpdateUserDto } from './dto/updateUser.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from './dto/registerUser.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/loginUser.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(userDto: UserDto) {
    const { name, username, email, avatar, password } = userDto;
    const findUser = await this.UserModel.findOne({ email });

    if (findUser) {
      throw new HttpException('Failed to create user.', HttpStatus.CONFLICT);
    }

    if (!name) {
      throw new HttpException('Enter name.', HttpStatus.NOT_FOUND);
    }

    if (!username) {
      throw new HttpException('Enter username.', HttpStatus.NOT_FOUND);
    }

    if (!email) {
      throw new HttpException('Enter email.', HttpStatus.NOT_FOUND);
    }

    if (!password) {
      throw new HttpException('Enter password.', HttpStatus.NOT_FOUND);
    }

    let avatarUrl: string | undefined;
    if (avatar) {
      const baseUrl = 'http://localhost:3000';
      avatarUrl = `${baseUrl}/uploads/${avatar}`;
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await this.UserModel.create({
      name,
      username,
      email,
      avatar: avatarUrl,
      password: hashPassword,
    });

    const token = await this.jwtService.sign({
      id: user._id,
      name,
      username,
      email,
      avatar:
        !avatar || avatar === ''
          ? 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxEQDw8QEBAQDg8PDw0PDQ0QDQ8NDw0PFhEWFhURExMYHSggGBolGxMTITEhJSk3Li4uFx8zODMsNygtLisBCgoKDQ0NDg0NDysZFRkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAwQBAgUGB//EADAQAQACAAMFBgYCAwEAAAAAAAABAgMEESExQVFxBRJhgZHBIjJSobHRovATQuFy/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANZxI5tf8ANHP7SCQR/wCaP7EsxiRzBuMRLIAAAAAAAAAAAAAAAAAAAMWtpvBlpfEiP0hvizO7ZCMEtsaeiOZYEAAAAGYlvXFmPFGAs1xYnwSKTemJMeMclFoa0tE7mwAAAAAAAAAAAAAMWnTaDF7aK1rTO8vbWWqAAAAAAAEAAAAAM1nTcs4d9evFVZrOm0Fwa0trDZQAAAAAAAAAAVsa+s6cITYttIVQAEAABpjY0UjWfKOMmNiRWszPDhznk5OJiTadZ3/gE2LnLTu+GPDf6oJnXft67WBUIlPhZu9ePejlO37oAHWwMxF92yeMJXFraYnWNkxul1ctjd+uvGNkx4oqUAAAG+HfSfDitKSxgW2acvwolAAAAAAAAAkFfHtt6ImZlhAAAABz+0cTW0V4RtnrKolzU/Hb/wBTHoiVAAAABYyOJpeI4W2T7K7NZ0mJ5TEg7QywigADfCtpMejQBdGKTrEMqAAAAAADXEnZLZHj/LPl+QVgEAAAAHJzddL266+u1Evdo4e63lPsoqgAAAA2w662iOcxH3arXZ+FrbvcK/kHSYBFAAAAWcCdiRFl909fZKoAAAAAAI8f5Z8vykaYsbJBVAQAAAAYtWJiYnbE73LzGBNJ5xwl1WLViY0mNYngDii9i5D6Z08J/aC2UvH+uvSYlUQCaMrf6fvEJ8LIfVPlH7BVwcKbzpHnPCHWwsOKxERw+/izSkVjSI0hlFAAAAAAWMvunr7JUeBGxIoAAAAAAMTDICnLCTGrpPXajQAAAQ5jMxTZvnlHuCYmXLxM1e3HSOUbEEyo7XejnHqd6OcerigO13o5x6nejnHq4oDtxI4iXDzN67p18J2wDrCvl83Ftk/DP2nosIAAANsOuswCzSNIhsCgAAAAAAACPGrrHRWXVXFppPhO4GgMXtpEzO6I1QQZzMd2NI+aftHNzJbXvNpmZ3y1VAAAAAAAABfyWZ1+G2//AFnn4KBE6bt/AHbGmBid6sT69W6KLGBXjzQ0rrOi3EKAAAAAAAAAADW9dY0bAKdo02KvaFtKac5iPf2dPEpr14S5XakaRWPGQc8AQAAAAAAAAABf7NtstHKYn++i7EOf2Z81unu7GFh6dfwKzh00jx4twAAAAAAAAAAAAAQ5nL1xI0t5TxhMA8/msnbD37a8LRu8+Su9RMKGY7MrbbX4J5b6+nAHGFjGyWJTfXWOdfihXEAAAAATYOUvfdWdOc7IBCmy+WtiT8MbONp3Q6OX7LiNt570/TGyv/XQrWIjSI0iN0RsgVBlMpXDjZttO+3P9LAAAAAAAAAAAAAAAAAAAAI8TArb5qxPjMRr6pAFO/ZmHPCY6Wn3Rz2TT6rfx/ToAOdHZNPqt/H9JK9mYcfVPW36XQEWHlqV3ViPHTWfVKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k='
          : avatarUrl,
    });

    return {
      data: {
        message: 'Created user successfully',
        user: {
          id: user._id,
          name,
          username,
          email,
          avatar: avatarUrl,
        },
      },
      token,
    };
  }

  async loginUser(login: LoginUserDto) {
    const { email, password, username } = login;

    const user = await this.UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (!user) {
      throw new HttpException(
        'There is an error in the email or password.',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatching = await bcrypt.compare(password, user.password);
    if (!passwordMatching) {
      throw new HttpException('', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.jwtService.sign({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });

    return {
      data: {
        message: 'You have been logged in successfully',
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        token,
      },
    };
  }

  async updateUser(updateUserDto: UpdateUserDto, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('User Not fund', HttpStatus.NOT_FOUND);
    }

    const { avatar, name, username, email } = updateUserDto;
    let avatarUrl: string | undefined;
    if (avatar) {
      const baseUrl = 'http://localhost:3000';
      avatarUrl = `${baseUrl}/uploads/${avatar}`;
    }

    const user = await this.UserModel.findByIdAndUpdate(
      id,
      { avatar: avatarUrl, name, username, email },
      { new: true },
    );

    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    const token = this.jwtService.sign({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });

    return {
      data: {
        message: 'Updated user successfully',
        user: user,
        token,
      },
    };
  }
}
