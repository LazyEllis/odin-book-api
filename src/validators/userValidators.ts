import { body } from "express-validator";
import { validate } from "../lib/utils.ts";
import { prisma } from "../lib/prisma.ts";

const nameValidators = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("The display name cannot be empty.")
    .isLength({ max: 50 })
    .withMessage("The display name must not exceed 50 characters."),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("The username cannot be empty.")
    .isLength({ min: 5, max: 15 })
    .withMessage("The username must be between 5 and 15 characters.")
    .matches(/^[A-Za-z0-9_]*$/)
    .withMessage(
      "The username can contain only letters, numbers, and underscores.",
    )
    .bail()
    .custom(async (value, { req }) => {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: value,
            mode: "insensitive",
          },
          NOT: {
            id: req.user?.id,
          },
        },
      });

      if (existingUser) {
        throw new Error("A user already exists with this username.");
      }
    }),
];

export const validateUserCreation = validate([
  ...nameValidators,
  body("password")
    .isStrongPassword()
    .withMessage(
      "The password must be at least 8 characters containing at least a lowercase and uppercase letter, a number and a symbol.",
    ),
  body("passwordConfirmation")
    .custom((value, { req }) => req.body.password === value)
    .withMessage("The passwords must match."),
]);
