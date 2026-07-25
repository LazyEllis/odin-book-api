import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/auth.ts";
import { selectPostFields, transformPost } from "../lib/selects.ts";

export const listCurrentUserLikes: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const likes = await prisma.like.findMany({
    where: {
      userId: id,
    },
    select: {
      post: {
        ...selectPostFields(id),
      },
    },
    orderBy: {
      likedAt: "desc",
    },
  });

  const likedPosts = likes.map((like) => transformPost(like.post));

  res.json(likedPosts);
};

export const likePost: RequestHandler = async (req, res) => {
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

  await prisma.like.upsert({
    create: {
      userId: id,
      postId: Number(postId),
    },
    update: {},
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  res.status(204).end();
};

export const unlikePost: RequestHandler = async (req, res) => {
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

  const like = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  if (!like) {
    return res.status(204).end();
  }

  await prisma.like.delete({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  res.status(204).end();
};
