import { body, check, param } from "express-validator";
import { validate } from "../middlewares/validation.ts";
import { prisma } from "../config/prisma.ts";

const nameValidators = [
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
    .custom(async (value, { req }) => {
      const user = await prisma.user.findFirst({
        where: {
          username: {
            equals: value,
            mode: "insensitive",
          },
          ...(req.user && {
            NOT: {
              id: req.user.id,
            },
          }),
        },
      });

      if (user) {
        throw new Error("This email is already in use.");
      }
    }),
];

export const validateUserCreation = validate([
  ...nameValidators,
  body("password")
    .isStrongPassword()
    .withMessage(
      "The password must be at least 8 characters long containing at least a lowercase and uppercase letter, a number and a special character.",
    ),
  body("passwordConfirmation")
    .custom((value, { req }) => req.body.password === value)
    .withMessage("The passwords must match."),
]);

export const validateUserUpdate = validate([
  ...nameValidators,
  body("description")
    .trim()
    .default(null)
    .isLength({ max: 160 })
    .withMessage("The description must not exceed 160 characters.")
    .optional({ values: "null" }),
  body("location")
    .trim()
    .default(null)
    .isLength({ max: 30 })
    .withMessage("The location must not exceed 30 characters.")
    .optional({ values: "null" }),
  body("url")
    .trim()
    .default(null)
    .isURL({ require_protocol: true })
    .withMessage("The URL must be a valid URL.")
    .optional({ values: "null" }),
]);

export const validateProfileImage = validate([
  check("profile_image")
    .custom((_, { req }) => req.file)
    .withMessage("You must upload an image.")
    .bail()
    .custom((_, { req }) => req.file.mimetype.startsWith("image"))
    .withMessage("You must upload a valid image file."),
]);

export const validateUserId = validate([
  param("userId").isInt().withMessage("The user ID must be an integer").toInt(),
]);
