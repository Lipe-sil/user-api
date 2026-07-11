import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { UserService } from "../services/user.service";
import { UserRepository } from "../repository/user.repository";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { UserQueue } from "../queue/queue";
import { ValidationDtoMiddleware } from "../middleware/validation.middleware";
import { CreateUserDTO } from "../dto/create_user.dto";
import { ChangeUserPasswordDTO } from "../dto/change_user_password";

const userRepository = new UserRepository();
const userQueue = new UserQueue();
const userService = new UserService(userRepository, userQueue);
const authMiddleware = new AuthMiddleware(userService);
const userController = new UserController(userService);
const createUserValidator = new ValidationDtoMiddleware(CreateUserDTO);
const changePasswordValidator = new ValidationDtoMiddleware(ChangeUserPasswordDTO);

const userRouter = Router();

userRouter.post(
  "/users",
  createUserValidator.validationMiddleware,
  userController.createUser.bind(userController),
);
userRouter.get(
  "/users/active-account/:code",
  userController.activeUserAccount.bind(userController),
);
userRouter.get(
  "/users",
  authMiddleware.canAccess.bind(authMiddleware),
  authMiddleware.isAdmin.bind(authMiddleware),
  userController.getAllUsers.bind(userController),
);
userRouter.get(
  "/users/me",
  authMiddleware.canAccess.bind(authMiddleware),
  userController.getMe.bind(userController),
);
userRouter.put(
  "/users/:id/password",
  authMiddleware.canAccess.bind(authMiddleware),
  authMiddleware.isTheSameUser.bind(authMiddleware),
  userController.changePassword.bind(userController),
);
userRouter.post(
  "/users/request-password-reset",
  changePasswordValidator.validationMiddleware,
  userController.requestPasswordReset.bind(userController),
);

export default userRouter;
