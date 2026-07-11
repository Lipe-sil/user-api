import { IsNotEmpty, IsString } from "class-validator";

export class ActiveAccountDTO {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
