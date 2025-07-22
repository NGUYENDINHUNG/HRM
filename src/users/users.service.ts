import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/users.schema';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;
    const userExits = await this.userModel.findOne({ email });
    if (userExits) {
      throw new BadRequestException(`Email ${email} đã tồn tại`);
    }
    const hashPassword = this.hashPassword(createUserDto.password);

    let newUser = await this.userModel.create({
      email,
      name,
      password: hashPassword,
    });
    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'không tim thấy người dùng';
    return this.userModel.findOne({ _id: id }).select('email, name');
  }

  findOneUserName(username: string) {
    return this.userModel.findOne({
      email: username,
    });
  }

  checkUserPassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: id }, { ...updateUserDto });
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'không tim thấy người dùng';
    return this.userModel.deleteOne({ _id: id });
  }
}
