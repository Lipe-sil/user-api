import { UserService } from "../services/user.service";
import { NextFunction, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { AuthRequest } from "../types/auth_request.types";

interface JwtPayload {
  id: string;
  role: string;
}

export class AuthMiddleware {
  constructor(private userService: UserService) { }

  async canAccess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req?.headers?.authorization;

      if (!authHeader) {
        return res.status(401).json({
          msg: "Authorization header missing",
          code: 401,
        });
      }
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          msg: "Invalid authorization header",
          code: 401,
        });
      }

      const token = authHeader.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          msg: "Token missing",
          code: 401,
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      const user = await this.userService.getUserById(decoded.id);

      if (!user) {
        return res.status(404).json({
          msg: "User not found",
          code: 404,
        });
      }

      req.user = user;
      next();
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return res.status(401).json({
          msg: "Expired token",
          code: 401,
        });
      }

      if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
          msg: "Invalid token",
          code: 401,
        });
      }
      console.error(err)
      return res.status(500).json({
        msg: "Internal server error",
        code: 500,
      });
    }
  }

  async isTheSameUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(403).json({ msg: "Forbidden: You can not access" });
      }

      const userId = req.user.id;
      const paramUserId = req.params.id;

      if (String(userId) !== String(paramUserId)) {
        return res.status(403).json({ msg: "Forbidden: You can not acess", code: 403 });
      }
      next();
    } catch (error: unknown) {
      console.log(error);
      return res.status(500).json({ msg: "Internal server error", code: 500 });
    }
  }

  async isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ msg: "User not found", code: 404 });
      }

      if (user.role !== "admin") {
        return res.status(403).json({ msg: "Forbidden: Admins only", code: 403 });
      }
      next();
    } catch (error: unknown) {
      console.log(error);
      return res.status(500).json({ msg: "Internal server error", code: 500 });
    }
  }
}
