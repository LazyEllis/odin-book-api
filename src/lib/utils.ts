import type { RequestHandler } from "express";
import { validationResult, type ValidationChain } from "express-validator";
import { UnauthorizedError } from "./errors.ts";

const validationHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  next();
};

export const validate = (validators: ValidationChain[]) => [
  ...validators,
  validationHandler,
];

export const getAuthenticatedUser = (user: Express.User | undefined) => {
  if (!user) {
    throw new UnauthorizedError("Unauthorized");
  }

  return user;
};
