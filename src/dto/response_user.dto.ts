import { UserDocument } from "../models/user.model";

export class ResponseUserDTO {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: UserDocument) {
    this.id = user._id.toString();
    this.name = user.name;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.active = user.active;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
