import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/common/decorator/customize';
import { IUser } from './user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileService } from 'src/upload-files/upload-files.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly UploadFileService: UploadFileService,
  ) {}

  @ResponseMessage('lấy thông tin người dùng thành công')
  @Get('me')
  handleGetAccount(@User() user: IUser) {
    const userId = user._id;
    return this.usersService.getMe(userId);
  }

  @ResponseMessage('cập nhật ảnh đại diện thành công')
  @Post('/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser,
  ) {
    const avatarUrl = await this.UploadFileService.Upload(file.originalname, {
      file: file.buffer,
      file_name: file.originalname,
    });
    return this.usersService.updateAvatar(user._id, avatarUrl.url);
  }

  @ResponseMessage('cập nhật thông tin người dùng thành công')
  @Patch('/update')
  update(@User() user: IUser, @Body() updateUserDto: UpdateUserDto) {
    const userId = user._id;
    return this.usersService.update(userId, updateUserDto);
  }
}
