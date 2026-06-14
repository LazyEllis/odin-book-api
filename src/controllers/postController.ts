import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { getAuthenticatedUser, postFields } from "../lib/utils.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";

export const listPosts: RequestHandler = async (req, res) => {
  const posts = await prisma.post.findMany({
    ...postFields,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(posts);
};

export const createPost: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { text, inReplyToPostId, quotedPostId } = req.body;
  const { conversationId } = res.locals;

  const post = await prisma.post.create({
    data: {
      text,
      authorId: id,
      inReplyToPostId,
      conversationId,
      quotedPostId,
    },
    ...postFields,
  });

  res.status(201).json(post);
};

export const getPostById: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
    ...postFields,
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  res.json(post);
};

export const deletePost: RequestHandler = async (req, res) => {
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
    throw new ForbiddenError("You don't have permission to delete this post");
  }

  await prisma.post.delete({
    where: {
      id: Number(postId),
    },
  });

  res.status(204).end();
};

export const listPostReplies: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const posts = await prisma.post.findMany({
    where: {
      inReplyToPostId: Number(postId),
    },
    ...postFields,
  });

  res.json(posts);
};

export const listPostQuotes: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const posts = await prisma.post.findMany({
    where: {
      quotedPostId: Number(postId),
    },
    ...postFields,
  });

  res.json(posts);
};
