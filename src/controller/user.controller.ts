import { plainToInstance } from "class-transformer";
import { UserService } from "../services/user.service";
import { CreateUserDTO } from "../dto/create_user.dto";
import { validate } from "class-validator";
import { Request, Response } from "express";

export class UserController {
    constructor(private userService: UserService) { }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const userDto = plainToInstance(CreateUserDTO, req.body);
            const errors = await validate(userDto);
            if (errors.length > 0) {
                res.status(400).json({ message: "Validation failed", errors });
                return;
            }

            const { name, lastName, email, password } = userDto;
            const result = await this.userService.createUser({ name, lastName, email, password });
            res.status(result.code).json({ message: result.msg });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.userService.getAllUsers();
            res.status(result.code).json({ message: result.msg, users: result.users });
        }
        catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            let userId = req.params.id;
            const { newPassword, resetPasswordToken } = req.body;

            if (Array.isArray(userId)) {
                userId = userId[0]
            }

            const result = await this.userService.changeUserPassword(userId, newPassword, resetPasswordToken);
            res.status(200).json({ message: result.msg });
        }
        catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async requestPasswordReset(req: Request, res: any): Promise<void> {
        try {
            const { email } = req.body;
            const result = await this.userService.newPasswordRequest(email);
            res.status(200).json({ message: result.msg });
        }
        catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}