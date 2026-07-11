import { Request, Response, NextFunction } from "express";
import { BadRequestError, ConflictError, NotFoundError } from "../handler/error.handler";

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

  console.error(err);

  return res.status(500).json({
    message: "Internal server error",
  });
}
