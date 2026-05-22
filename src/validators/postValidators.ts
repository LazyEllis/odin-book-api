import { body } from "express-validator";
import { validate } from "../lib/utils.ts";
import { prisma } from "../lib/prisma.ts";

export const validatePost = validate([
  body("text")
    .trim()
    .notEmpty()
    .withMessage("The post text must not be empty."),
  body("inReplyToPostId")
    .default(null)
    .isInt()
    .withMessage("The inReplyToPostId must be an integer.")
    .toInt()
    .bail()
    .custom(async (value) => {
      const post = await prisma.post.findUnique({
        where: {
          id: value,
        },
      });

      if (!post) {
        throw new Error("The replied-to post does not exist.");
      }
    })
    .optional({ values: "null" }),
  body("quotedPostId")
    .default(null)
    .isInt()
    .withMessage("The quotedPostId must be an integer.")
    .toInt()
    .custom((value, { req }) => value !== req.body.inReplyToPostId)
    .withMessage("The post cannot quote and reply to the same tweet")
    .bail()
    .custom(async (value) => {
      const post = await prisma.post.findUnique({
        where: {
          id: value,
        },
      });

      if (!post) {
        throw new Error("The quoted post does not exist.");
      }
    })
    .optional({ values: "null" }),
]);
