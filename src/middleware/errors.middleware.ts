import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../handler/error.handler";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ConflictError) {
    return res.status(409).json({ message: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  if (err instanceof BadRequestError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(403).json({ message: err.message });
  }

  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      message: err.message
    });
  }

  if (err instanceof JsonWebTokenError) {
    return res.status(401).json({
      message: err.message
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Internal server error",
  });
}
