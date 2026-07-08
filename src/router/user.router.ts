import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repository/user.repository";
import { AuthMiddleware } from "../middleware/auth.middleware";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const authMiddleware = new AuthMiddleware(userService);
const userController = new UserController(userService);


const userRouter = Router();

userRouter.post("/users", userController.createUser.bind(userController));
userRouter.get("/users", authMiddleware.canAccess.bind(authMiddleware), authMiddleware.isAdmin.bind(authMiddleware), userController.getAllUsers.bind(userController));
userRouter.put("/users/:id/password", authMiddleware.canAccess.bind(authMiddleware), authMiddleware.isTheSameUser.bind(authMiddleware), userController.changePassword.bind(userController));
userRouter.post("/users/request-password-reset", userController.requestPasswordReset.bind(userController));

export default userRouter;