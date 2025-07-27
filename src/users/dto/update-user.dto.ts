import { OmitType } from '@nestjs/mapped-types';
import { RegisterusersDto } from './create-user.dto';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto extends OmitType(RegisterusersDto, [
  'password',
] as const) {
  @IsOptional()
  @IsNotEmpty({
    message: 'email không được để trống',
  })
  @IsEmail({}, { message: 'email không đúng định dạng' })
  email: string;
  @IsOptional()
  @IsNotEmpty({ message: 'ten khong dc de trong' })
  @MinLength(3, { message: 'ten phai lon hon 3 ky tu' })
  @MaxLength(20, { message: 'ten phai nho hon 20 ky tu' })
  name: string;
}
