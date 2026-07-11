import { Request } from "express";
import { ResponseUserDTO } from "../dto/response_user.dto";

export interface AuthRequest extends Request {
  user?: ResponseUserDTO;
}
