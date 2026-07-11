import { UserModel, UserDocument, User } from "../models/user.model";

export class UserRepository {
  async create(data: User): Promise<UserDocument> {
    return UserModel.create(data);
  }

  async getById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  }

  async activeUser(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { active: true, updatedAt: new Date() }, { new: true });
  }

  async getByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      email: email,
    });
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return UserModel.find();
  }

  async updateUser(id: string, data: Partial<User>): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async getUserByResetToken(token: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      resetPasswordToken: token,
    });
  }

  async getUserByVerifyCode(code: string): Promise<UserDocument | null> {
    return UserModel.findOne({ code: code, active: false });
  }
}
