import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/auth.ts";
import { postFields, userFields } from "../lib/selects.ts";

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

  const replies = await prisma.post.findMany({
    where: {
      inReplyToPostId: Number(postId),
    },
    ...postFields,
  });

  res.json(replies);
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

  const quotes = await prisma.post.findMany({
    where: {
      quotedPostId: Number(postId),
    },
    ...postFields,
  });

  res.json(quotes);
};

export const listPostReposters: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const reposts = await prisma.repost.findMany({
    where: {
      postId: Number(postId),
    },
    select: {
      user: {
        ...userFields,
      },
    },
  });

  const repostingUsers = reposts.map((repost) => repost.user);

  res.json(repostingUsers);
};

export const listPostLikers: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const likes = await prisma.like.findMany({
    where: {
      postId: Number(postId),
    },
    select: {
      user: {
        ...userFields,
      },
    },
  });

  const likingUsers = likes.map((like) => like.user);

  res.json(likingUsers);
};
