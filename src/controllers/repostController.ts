import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.ts";
import { NotFoundError } from "../utils/errors.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";

export const repostPost: RequestHandler = async (req, res) => {
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

  await prisma.repost.upsert({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
    create: {
      userId: id,
      postId: Number(postId),
    },
    update: {},
  });

  res.status(204).end();
};

export const unrepostPost: RequestHandler = async (req, res) => {
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

  const repost = await prisma.repost.findUnique({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  if (!repost) {
    return res.status(204).end();
  }

  await prisma.repost.delete({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  res.status(204).end();
};
