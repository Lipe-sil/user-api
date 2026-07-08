import { CreateUserDTO } from "../dto/create_user.dto";
import { ResponseUserDTO } from "../dto/response_user.dto";
import { UpdateUserDTO } from "../dto/update_user.dto";
import { User } from "../models/user.model";
import { UserRepository } from "../repository/user.repository";
import bcrypt from 'bcrypt';
import crypto from "crypto";


export class UserService {
    constructor(private userRepository: UserRepository) { }

    async createUser(data: CreateUserDTO): Promise<{ msg: string, code: number }> {
        try {
            const existingUser = await this.userRepository.getByEmail(data.email);
            if (existingUser) {
                throw new Error("User with this email already exists");
            }

            const passwordHashed = await this.hashPassword(data.password);
            const newUser: User = {
                password: passwordHashed,
                name: data.name,
                lastName: data.lastName,
                email: data.email,
                code: crypto.randomBytes(32).toString("hex"),
                active: false,
                role: 'user',
                resetPasswordToken: null,
                refreshToken: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }


            await this.userRepository.create(newUser);

            return {
                msg: "User created successfully",
                code: 201
            }

        } catch (error: any) {
            throw new Error("Error creating user: " + error.message);
        }
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async verifyUser(email: string, code: string): Promise<{ msg: string, code: number }> {
        try {
            const user = await this.userRepository.getByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }

            if (user.code !== code) {
                throw new Error("Invalid verification code");
            }
            
            await this.userRepository.activeUser(user._id.toString());

            return {
                msg: "User verified successfully",
                code: 200
            };

        } catch (error: any) {
            throw new Error("Error verifying user: " + error.message);
        }
    }

    async sendVerificationEmail(email: string, code: string): Promise<void> {
        console.log(`Sending verification email to ${email} with code: ${code}`);
    }

    async getUserById(id: string): Promise<ResponseUserDTO | null> {
        try {
            const user = await this.userRepository.getById(id);
            if (!user) {
                return null
            }
            return {
                id: user._id.toString(),
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                active: user.active,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt

            };
        } catch (error: any) {
            throw new Error("Error retrieving user: " + error.message);
        }
    }

    async changeUserPassword(id: string, newPassword: string, resetPasswordToken: string): Promise<{ msg: string }> {
        try {
            const user = await this.userRepository.getById(id);
            if (!user) {
                throw new Error("User not found");
            }

            if (user.resetPasswordToken !== resetPasswordToken) {
                throw new Error("Invalid reset password token");
            }

            const hashedPassword = await this.hashPassword(newPassword);
            await this.userRepository.updateUser(id, { password: hashedPassword, resetPasswordToken: null, updatedAt: new Date() });
            return {
                msg: "Password changed successfully",
            };
        } catch (error: any) {
            throw new Error("Error changing password: " + error.message);
        }
    }

    async newPasswordRequest(email: string): Promise<{ msg: string }> {
        try {
            const user = await this.userRepository.getByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }

            const resetToken = crypto.randomBytes(32).toString("hex");;
            await this.userRepository.updateUser(user._id.toString(), { resetPasswordToken: resetToken });

            console.log(`Sending password reset email to ${email} with token: ${resetToken}`);

            return {
                msg: "Password reset request successful. Please check your email for further instructions.",
            };
        } catch (error: any) {
            throw new Error("Error requesting new password: " + error.message);
        }
    }

    async getAllUsers(): Promise<{ msg: string, code: number, users?: ResponseUserDTO[] }> {
        try {
            const users = await this.userRepository.getAllUsers();
            return {
                msg: "Users retrieved successfully",
                code: 200,
                users: users.map(user => ({
                    id: user._id.toString(),
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    active: user.active,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }))
            };
        } catch (error: any) {
            throw new Error("Error retrieving users: " + error.message);
        }
    }

    async updateUser(id: string, data: Partial<UpdateUserDTO>): Promise<{ msg: string, code: number }> {
        try {
            const user = await this.userRepository.getById(id);
            if (!user) {
                throw new Error("User not found");
            }

            const updateData = {
                name: data.name,
                lastName: data.lastName
            }

            await this.userRepository.updateUser(id, { ...updateData, updatedAt: new Date() });
            return {
                msg: "User updated successfully",
                code: 200
            };
        } catch (error: any) {
            throw new Error("Error updating user: " + error.message);
        }
    }
}