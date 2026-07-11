import { CreateUserDTO } from "../dto/create_user.dto";
import { ResponseUserDTO } from "../dto/response_user.dto";
import { UpdateUserDTO } from "../dto/update_user.dto";
import { User } from "../models/user.model";
import { UserRepository } from "../repository/user.repository";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserQueue } from "../queue/queue";
import { BadRequestError, ConflictError, NotFoundError } from "../handler/error.handler";

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userQueue: UserQueue,
  ) {}

  async createUser(data: CreateUserDTO): Promise<{ msg: string }> {
    const existingUser = await this.userRepository.getByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const passwordHashed = await this.hashPassword(data.password);
    const newUser: User = {
      password: passwordHashed,
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      code: crypto.randomBytes(32).toString("hex"),
      active: false,
      role: "user",
      resetPasswordToken: null,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepository.create(newUser);

    if (!newUser.code) {
      throw new Error("Error to generate user code");
    }

    try {
      await this.userQueue.sendVerificationCode(data.email, newUser.code);
    } catch (error) {
      console.error("Error to send verification code:", error);
    }

    return {
      msg: "User created successfully",
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async activeUserAccount(code: string): Promise<{ msg: string }> {
    const user = await this.userRepository.getUserByVerifyCode(code);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userRepository.activeUser(user._id.toString());

    try {
      await this.userQueue.sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      console.log(`Error to send welcome email`, err);
    }

    return {
      msg: "User verified successfully",
    };
  }

  async getUserById(id: string | undefined): Promise<ResponseUserDTO | null> {
    if (!id) {
      throw new BadRequestError("Params not found");
    }

    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return new ResponseUserDTO(user);
  }

  async changeUserPassword(token: string, newPassword: string): Promise<{ msg: string }> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepository.getUserByResetToken(tokenHash);

    if (!user) {
      throw new BadRequestError("Invalid or expired reset password token");
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestError("Reset password token has expired");
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.userRepository.updateUser(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: undefined,
      updatedAt: new Date(),
    });

    return {
      msg: "Password changed successfully",
    };
  }

  async newPasswordRequest(email: string): Promise<{ msg: string }> {
    const user = await this.userRepository.getByEmail(email);
    if (!user) {
      return {
        msg: "If an account with this email exists, you will receive password reset instructions.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.updateUser(user._id.toString(), {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expires,
    });

    try {
      await this.userQueue.sendResetPasswordEmail(user.email, token);
    } catch (err) {
      console.log(`Error to send password token`, err);
    }

    return {
      msg: "If an account with this email exists, you will receive password reset instructions.",
    };
  }

  async getAllUsers(): Promise<{ msg: string; users?: ResponseUserDTO[] }> {
    const users = await this.userRepository.getAllUsers();
    return {
      msg: "Users retrieved successfully",
      users: users.map((user) => new ResponseUserDTO(user)),
    };
  }

  async updateUser(id: string, data: Partial<UpdateUserDTO>): Promise<{ msg: string }> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updateData = {
      name: data.name,
      lastName: data.lastName,
    };

    await this.userRepository.updateUser(id, { ...updateData, updatedAt: new Date() });
    return {
      msg: "User updated successfully",
    };
  }
}
