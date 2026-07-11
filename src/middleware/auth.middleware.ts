import { UserService } from "../services/user.service";
import { NextFunction, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AuthRequest } from "../types/auth_request.types";
import { UnauthorizedError } from "../handler/error.handler";

interface JwtPayload {
  id: string;
  role: string;
}

export class AuthMiddleware {
  constructor(private userService: UserService) { }

  async canAccess(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req?.headers?.authorization;

    if (!authHeader) {
      throw new JsonWebTokenError("Authorization header missing");
    }
    if (!authHeader.startsWith("Bearer ")) {
      throw new JsonWebTokenError("Invalid authorization header");
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new JsonWebTokenError("Token missing");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;

      const user = await this.userService.getUserById(decoded.id);

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      req.user = user;
      next();
    } catch (err) {
      throw new UnauthorizedError("Invalid token")
    }
  }

  async isTheSameUser(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new UnauthorizedError("You are not allowed to access this resource.");
    }

    const userId = req.user.id;
    const paramUserId = req.params.id;

    if (String(userId) !== String(paramUserId)) {
      throw new UnauthorizedError("You are not allowed to access this resource.");
    }
    next();
  }

  async isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.role !== "admin") {
      throw new UnauthorizedError("Forbidden: Admins only");
    }

    next();
  }
}
