import type { ErrorRequestHandler, RequestHandler } from "express";
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

export const getRequestUser = (user: Express.User | undefined) => {
  if (!user) {
    throw new UnauthorizedError("Unauthorized");
  }

  return user;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
};
