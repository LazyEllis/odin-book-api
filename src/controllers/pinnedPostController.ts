import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.ts";
import { ForbiddenError, NotFoundError } from "../utils/errors.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";

export const pinPost: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.authorId !== id) {
    throw new ForbiddenError("You don't have permission to pin this post");
  }

  await prisma.user.update({
    data: {
      pinnedPostId: Number(postId),
    },
    where: {
      id,
    },
  });

  res.status(204).end();
};

export const unpinPost: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  if (post.authorId !== id) {
    throw new ForbiddenError("You don't have permission to unpin this post");
  }

  await prisma.user.update({
    data: {
      pinnedPostId: null,
    },
    where: {
      id,
    },
  });

  res.status(204).end();
};
