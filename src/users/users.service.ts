import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import * as bcrypt from 'bcrypt';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ConfigService } from '@nestjs/config';
import { IUser } from './user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };
  findOneUserName(email: string) {
    return this.userModel.findOne({
      email: email,
    });
  }
  checkUserPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
  async getMe(id: string) {
    try {
      const user = await this.userModel
        .findById(id)
        .select(
          '-password -deletedAt -isDeleted -createdAt -updatedAt -__v -refreshToken',
        );
      if (!user) {
        throw new NotFoundException('Không tim thấy người dùng');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi lấy thông tin người dùng',
      );
    }
  }
  async updateAvatar(userId: string, avatarUrl: string) {
    await this.userModel.findByIdAndUpdate(userId, { avatar: avatarUrl });
    return { avatar: avatarUrl };
  }
  async update(userId: string, updateUserDto: UpdateUserDto) {
    let UserUpdate = await this.userModel
      .findByIdAndUpdate(userId, updateUserDto, {
        new: true,
      })
      .select(
        '-password -deletedAt -isDeleted -createdAt -updatedAt -__v -refreshToken',
      );

    return UserUpdate;
  }
  updateUserToken = async (refreshToken: string, _id: string) => {
    await this.userModel.updateOne({ _id }, { refreshToken });
  };
  FindUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken });
  };
  //find by email
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user) return null;

    return {
      ...user,
      _id: user._id.toString(),
    };
  }
}
