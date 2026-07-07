import { CreateUserDTO } from "../dto/create_user.dto";
import { User } from "../models/user.model";
import { UserRepository } from "../repository/user.repository";
import bcrypt from 'bcrypt';

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
                code: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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

    async hashPassword(password: string): Promise<string> {
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

    async getUserById(id: string): Promise<{ msg: string, code: number, user?: any }> {
        try {
            const user = await this.userRepository.getById(id);
            if (!user) {
                return {
                    msg: "User not found",
                    code: 404
                };
            }
            return {
                msg: "User retrieved successfully",
                code: 200,
                user: {
                    id: user._id,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    active: user.active,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            };
        } catch (error: any) {
            throw new Error("Error retrieving user: " + error.message);
        }
    }


    async getAllUsers(): Promise<{ msg: string, code: number, users?: any[] }> {
        try {
            const users = await this.userRepository.getAllUsers();
            return {
                msg: "Users retrieved successfully",
                code: 200,
                users: users.map(user => ({
                    id: user._id,
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

}