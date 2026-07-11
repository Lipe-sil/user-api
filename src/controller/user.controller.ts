import { UserService } from "../services/user.service";
import { Request, Response } from "express";

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    const { name, lastName, email, password } = req.body;

    const result = await this.userService.createUser({ name, lastName, email, password });
    res.status(201).json({ message: result.msg });
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    const result = await this.userService.getAllUsers();
    res.status(200).json({ message: result.msg, users: result.users });
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const { newPassword, resetPasswordToken } = req.body;
    const result = await this.userService.changeUserPassword(newPassword, resetPasswordToken);
    res.status(200).json({ message: result.msg });
  }

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const result = await this.userService.newPasswordRequest(email);
    res.status(200).json({ message: result.msg });
  }

  async activeUserAccount(req: Request, res: Response): Promise<void> {
    let code = req.params.code;

    if (!code) {
      res.status(400).json({
        message: "Activation code is required",
      });
      return;
    }

    if (Array.isArray(code)) {
      code = code[0];
    }

    const result = await this.userService.activeUserAccount(code);

    res.status(200).json({
      message: result.msg,
    });
  }
}
