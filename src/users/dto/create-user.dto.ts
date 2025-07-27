import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// export class CreateUserDto {
//   @IsNotEmpty({
//     message: 'email không được để trống',
//   })
//   @IsEmail({}, { message: 'email không đúng định dạng' })
//   email: string;
//   @IsNotEmpty({ message: 'ten khong dc de trong' })
//   @MinLength(3, { message: 'ten phai lon hon 3 ky tu' })
//   @MaxLength(20, { message: 'ten phai nho hon 20 ky tu' })
//   name: string;

//   @IsNotEmpty({ message: 'mat khau khong dc de trong' })
//   password: string;
//   @IsOptional()
//   @Matches(/^(0|\+84)[1-9][0-9]{8}$/, {
//     message: 'Số điện thoại không hợp lệ',
//   })
//   @MinLength(1, { message: 'số điện thoại phai lon hon 1 ky tu' })
//   @MaxLength(10, { message: 'số điện thoại phai nho hon 10 ky tu' })
//   phone: string;
//   @IsOptional()
//   @MinLength(3, { message: 'địa chỉ phai lon hon 3 ky tu' })
//   @MaxLength(500, { message: 'địa chỉ phai nho hon 500 ky tu' })
//   address: string;
// }

export class RegisterusersDto {
  @IsNotEmpty({
    message: 'email không được để trống',
  })
  @IsEmail({}, { message: 'email không đúng định dạng' })
  email: string;
  @IsNotEmpty({ message: 'ten khong dc de trong' })
  @MinLength(3, { message: 'ten phai lon hon 3 ky tu' })
  @MaxLength(20, { message: 'ten phai nho hon 20 ky tu' })
  name: string;

  @IsNotEmpty({ message: 'mat khau khong dc de trong' })
  password: string;
  @IsOptional()
  @Matches(/^(0|\+84)[1-9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  @MinLength(1, { message: 'số điện thoại phai lon hon 1 ky tu' })
  @MaxLength(10, { message: 'số điện thoại phai nho hon 10 ky tu' })
  phone: string;
  @IsOptional()
  @MinLength(3, { message: 'địa chỉ phai lon hon 3 ky tu' })
  @MaxLength(500, { message: 'địa chỉ phai nho hon 500 ky tu' })
  address: string;
}
