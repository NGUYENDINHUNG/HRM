import ms from 'ms';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from 'src/users/schema/users.schema';
import { RegisterusersDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { IUser } from 'src/users/user.interface';
import { log } from 'console';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async registers(user: RegisterusersDto) {
    try {
      const { name, email, password, address } = user;

      const Usersexis = await this.userModel.findOne({ email });
      if (Usersexis) {
        throw new BadRequestException(`Email ${email} đã tồn tại`);
      }

      const hashPassword = this.hashPassword(password);

      const Newuser = await this.userModel.create({
        name,
        email,
        address,
        password: hashPassword,
      });

      return Newuser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Đăng ký thất bại, vui lòng thử lại',
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
}
