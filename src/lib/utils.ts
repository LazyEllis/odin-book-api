import type { ErrorRequestHandler, RequestHandler } from "express";
import { validationResult, type ValidationChain } from "express-validator";

const validationHandler: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  next();
};

export const validate = (validators: ValidationChain[]) => [
  validators,
  validationHandler,
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
};
