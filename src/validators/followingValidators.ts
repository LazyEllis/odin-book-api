import { param } from "express-validator";
import { validate } from "../middlewares/validation.ts";

export const validateUserId = validate([
  param("userId")
    .isInt()
    .withMessage("The user ID must be an integer")
    .toInt()
    .custom((value, { req }) => req.user.id !== value)
    .withMessage("The user ID cannot not be the authenticated user's ID"),
]);
