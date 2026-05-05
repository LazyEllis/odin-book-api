import { body, param } from "express-validator";
import { validate } from "../lib/utils.ts";
import { prisma } from "../lib/prisma.ts";

export const validateUserCreation = validate([
  body("name")
    .trim()
    .notEmpty()
    .withMessage("The display name must not be empty.")
    .isLength({ max: 50 })
    .withMessage("The display name must not exceed 50 characters"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("The username must not be empty.")
    .isLength({ min: 5, max: 15 })
    .withMessage("The username must be within 5 and 15 characters.")
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage(
      "The username can contain only letters, numbers, and underscores",
    )
    .bail()
    .custom(async (value) => {
      const user = await prisma.user.findFirst({
        where: {
          username: {
            equals: value,
            mode: "insensitive",
          },
        },
      });

      if (user) {
        throw new Error("This email is already in use.");
      }
    }),
  body("password")
    .isStrongPassword()
    .withMessage(
      "The password must be at least 8 characters long containing at least a lowercase and uppercase letter, a number and a special character.",
    ),
  body("passwordConfirmation")
    .custom((value, { req }) => req.body.password === value)
    .withMessage("The passwords must match."),
]);

export const validateUserId = validate([
  param("userId").isInt().withMessage("The user ID must be an integer").toInt(),
]);
