import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User, UserDocument } from 'src/users/schema/users.schema';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  RegisterusersDto,
} from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { IUser } from 'src/users/user.interface';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { hashPasswordHelper } from 'src/helper/ultil';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneUserName(email);
    if (user) {
      const isValid = this.usersService.checkUserPassword(pass, user.password);
      if (isValid === true) {
        return user;
      }
    }
    return null;
  }
  createRefreshToken = (payload) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    });
    return refresh_token;
  };
  hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };
  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };

  async registers(registerDto: RegisterusersDto) {
    const { name, email, password } = registerDto;

    //check email
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException(
        `Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`,
      );
    }

    //hash password
    const hashPassword = this.hashPassword(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account ', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    //trả ra phản hồi
    return {
      _id: user._id,
    };
  }

  async handleActive(data: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: data._id,
      codeId: data.code,
    });
    if (!user) {
      throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
    }

    //check expire code
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);

    if (isBeforeCheck) {
      //valid => update user
      await this.userModel.updateOne(
        { _id: data._id },
        {
          isActive: true,
        },
      );
      return { isBeforeCheck };
    } else {
      throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
    }
  }

  async retryActive(email: string) {
    //check email
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    if (user.isActive) {
      throw new BadRequestException('Tài khoản đã được kích hoạt');
    }

    //send Email
    const codeId = uuidv4();

    //update user
    await user.updateOne({
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activate your account at @hoidanit', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return { _id: user._id };
  }
  async login(user: IUser, response: Response) {
    const { _id, name, email } = user;
    const payload = {
      _id,
      name,
      email,
    };
    try {
      const refresh_token = this.createRefreshToken(payload);

      await this.usersService.updateUserToken(refresh_token, _id);

      // Set cookie

      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        maxAge: (ms as any)(
          this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE'),
        ),
      });

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw new InternalServerErrorException(
        'Đăng nhập thất bại, vui lòng thử lại sau.',
      );
    }
  }
  async processNewToken(refreshToken: string, response: Response) {
    try {
      let a = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      let user = await this.usersService.FindUserByToken(refreshToken);

      if (user) {
        const { _id, name, email } = user;
        const payload = {
          _id,
          name,
          email,
        };

        const refresh_token = this.createRefreshToken(payload);

        response.clearCookie('refresh_token');

        await this.usersService.updateUserToken(refresh_token, _id.toString());

        //update new cookies
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: (ms as any)(
            this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRE'),
          ),
        });
        return {
          access_token: this.jwtService.sign(payload),
        };
      } else {
        throw new BadRequestException(`token đã hết hạn `);
      }
      //todo
    } catch (error) {
      throw new BadRequestException(`token đã hết hạn`);
    }
  }
  async logout(response: Response, user: IUser) {
    await this.usersService.updateUserToken('', user._id);
    response.clearCookie('refresh_token');
    return 'ok';
  }
  async retryPassword(email: string) {
    //check email
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    //send Email
    const codeId = uuidv4();

    //update user
    await user.updateOne({
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });

    //send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Change your password account', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return { _id: user._id, email: user.email };
  }
  async changePassword(data: ChangePasswordAuthDto) {
    if (data.confirmPassword !== data.password) {
      throw new BadRequestException(
        'Mật khẩu/xác nhận mật khẩu không chính xác.',
      );
    }

    //check email
    const user = await this.userModel.findOne({ email: data.email });

    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    //check expire code
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);

    if (isBeforeCheck) {
      //valid => update password
      const newPassword = await hashPasswordHelper(data.password);
      await user.updateOne({ password: newPassword });
      return { isBeforeCheck };
    } else {
      throw new BadRequestException('Mã code không hợp lệ hoặc đã hết hạn');
    }
  }
}
