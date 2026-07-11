import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

export class ValidationDtoMiddleware<T extends object> {
  constructor(private dto: ClassConstructor<T>) {}

  validationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const body = plainToInstance(this.dto, req.body);

    const errors = await validate(body);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    req.body = body;
    next();
  };
}
