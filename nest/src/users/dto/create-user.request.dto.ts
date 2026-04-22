import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserRequestDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;
}
