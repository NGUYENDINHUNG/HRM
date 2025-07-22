
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({
    message: 'email không được để trống',
  })
  @IsEmail(
    {},
    {
      message: 'email không đúng định dạng',
    },
  )
  email: string;
  @IsNotEmpty({message: 'ten khong dc de trong'})
  @MinLength(3,{message: 'ten phai lon hon 3 ky tu'})
  @MaxLength(20,{message:'ten phai nho hon 20 ky tu'})
  name: string;

  @IsNotEmpty({message: 'mat khau khong dc de trong'})
  password: string;
}
