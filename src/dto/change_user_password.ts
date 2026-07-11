import { IsNotEmpty, IsString, Length } from "class-validator";

export class ChangeUserPasswordDTO {
  @IsString()
  @IsNotEmpty()
  @Length(8, 14)
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  resetPasswordToken!: string;
}
