import { plainToInstance } from "class-transformer";
import { UserService } from "../services/user.service";
import { CreateUserDTO } from "../dto/create_user.dto";
import { validate } from "class-validator";

export class UserController {
    constructor(private userService: UserService) { }

    async createUser(req: any, res: any): Promise<void> {
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

    async getUserById(req: any, res: any): Promise<void> {
        try {
            const userId = req.params.id;
            const result = await this.userService.getUserById(userId);
            res.status(result.code).json({ message: result.msg, user: result.user });
        }
        catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllUsers(req: any, res: any): Promise<void> {
        try {
            const result = await this.userService.getAllUsers();
            res.status(result.code).json({ message: result.msg, users: result.users });
        }
        catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}