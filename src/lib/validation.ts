import type { RequestHandler } from "express";
import { validationResult, type ValidationChain } from "express-validator";

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
