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

export const userFields = {
  omit: {
    password: true,
  },
  include: {
    _count: {
      select: {
        followers: true,
        following: true,
      },
    },
  },
};

export const postFields = {
  omit: {
    authorId: true,
    inReplyToPostId: true,
    quotedPostId: true,
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        username: true,
        profileImageUrl: true,
      },
    },
    repliedTo: {
      select: {
        id: true,
        text: true,
        attachment: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    },
    quotedPost: {
      select: {
        id: true,
        text: true,
        attachment: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    },
    _count: {
      select: {
        reposts: true,
        replies: true,
        likes: true,
        quotes: true,
        bookmarks: true,
      },
    },
  },
};
