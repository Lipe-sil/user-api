import { UserService } from "../services/user.service";
import jwt from "jsonwebtoken";

export class AuthMiddleware {
    constructor(private userService: UserService) { }


    async canAccess(req: any, res: any, next: any) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    msg: "Authorization header missing",
                    code: 401
                });
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                return res.status(401).json({
                    msg: "Token missing",
                    code: 401
                });
            }

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

            req.userId = decoded.id;

            const user = await this.userService.getUserById(req.userId);

            if (!user) {
                return res.status(404).json({
                    msg: "User not found",
                    code: 404
                });
            }
            next();

        } catch (err) {
            return res.status(401).json({
                msg: "Invalid token",
                code: 401
            });
        }
    }

    async isTheSameUser(req: any, res: any, next: any) {
        try {
            const userId = req.userId;
            const paramUserId = req.params.id;

            if (String(userId) !== String(paramUserId)) {
                return res.status(403).json({ msg: "Forbidden: You can only access your own data", code: 403 });
            }
            next();
        }
        catch (error: any) {
            return res.status(500).json({ msg: "Internal server error", code: 500 });
        }
    }


    async isAdmin(req: any, res: any, next: any) {
        try {
            const userId = req.userId;
            const result = await this.userService.getUserById(userId);

            if (!result) {
                return res.status(404).json({ msg: "User not found", code: 404 });
            }

            if (result.user.role !== "admin") {
                return res.status(403).json({ msg: "Forbidden: Admins only", code: 403 });
            }
            next();
        }
        catch (error: any) {
            return res.status(500).json({ msg: "Internal server error", code: 500 });
        }
    }
}