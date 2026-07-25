import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.ts";
import { ForbiddenError, NotFoundError } from "../utils/errors.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";
import {
  selectPostFields,
  selectUserFields,
  transformPost,
  transformUser,
} from "../utils/selects.ts";

export const listPosts: RequestHandler = async (req, res) => {
  const rawPosts = await prisma.post.findMany({
    ...selectPostFields(req.user?.id),
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = rawPosts.map(transformPost);

  res.json(posts);
};

export const createPost: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { text, inReplyToPostId, quotedPostId } = req.body;
  const { conversationId } = res.locals;

  const rawPost = await prisma.post.create({
    data: {
      text,
      authorId: id,
      inReplyToPostId,
      conversationId,
      quotedPostId,
    },
    ...selectPostFields(id),
  });

  const post = transformPost(rawPost);

  res.status(201).json(post);
};

export const getPostById: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const rawPost = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
    ...selectPostFields(req.user?.id),
  });

  if (!rawPost) {
    throw new NotFoundError("Post not found");
  }

  const post = transformPost(rawPost);

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

  const rawReplies = await prisma.post.findMany({
    where: {
      inReplyToPostId: Number(postId),
    },
    ...selectPostFields(req.user?.id),
  });

  const replies = rawReplies.map(transformPost);

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

  const rawQuotes = await prisma.post.findMany({
    where: {
      quotedPostId: Number(postId),
    },
    ...selectPostFields(req.user?.id),
  });

  const quotes = rawQuotes.map(transformPost);

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
        ...selectUserFields(req.user?.id),
      },
    },
  });

  const repostingUsers = reposts.map((repost) => transformUser(repost.user));

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
        ...selectUserFields(req.user?.id),
      },
    },
  });

  const likingUsers = likes.map((like) => transformUser(like.user));

  res.json(likingUsers);
};
