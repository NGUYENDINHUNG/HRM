import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/common/decorator/customize';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  RegisterusersDto,
} from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/user.interface';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailerService: MailerService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('đăng nhập thành công')
  @Post('login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }
  @Public()
  @Post('register')
  @ResponseMessage('đăng kí thành công ')
  create(@Body() user: RegisterusersDto) {
    return this.authService.registers(user);
  }

  @Public()
  @ResponseMessage('refreshtoken thành công')
  @Get('refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @Post('check-code')
  @Public()
  checkCode(@Body() registerDto: CodeAuthDto) {
    return this.authService.handleActive(registerDto);
  }

  @Post('retry-active')
  @Public()
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }
  @ResponseMessage('đã gửi otp đến email')
  @Post('retry-password')
  @Public()
  retryPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }
  @ResponseMessage('dổi mật khẩu thành công')
  @Post('change-password')
  @Public()
  changePassword(@Body() data: ChangePasswordAuthDto) {
    return this.authService.changePassword(data);
  }
  @ResponseMessage('đăng xuất thành công')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    //req.user
    return this.authService.logout(response, user);
  }
}
