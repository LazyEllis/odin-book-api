import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.ts";
import { ForbiddenError, NotFoundError } from "../utils/errors.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";
import { buildPostSelect, mapToPostResponse } from "../mappers/postMapper.ts";
import { buildUserSelect, mapToUserResponse } from "../mappers/userMapper.ts";

export const listPosts: RequestHandler = async (req, res) => {
  const rawPosts = await prisma.post.findMany({
    ...buildPostSelect(req.user?.id),
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = rawPosts.map(mapToPostResponse);

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
    ...buildPostSelect(id),
  });

  const post = mapToPostResponse(rawPost);

  res.status(201).json(post);
};

export const getPostById: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const rawPost = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
    ...buildPostSelect(req.user?.id),
  });

  if (!rawPost) {
    throw new NotFoundError("Post not found");
  }

  const post = mapToPostResponse(rawPost);

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
    ...buildPostSelect(req.user?.id),
  });

  const replies = rawReplies.map(mapToPostResponse);

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
    ...buildPostSelect(req.user?.id),
  });

  const quotes = rawQuotes.map(mapToPostResponse);

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
        ...buildUserSelect(req.user?.id),
      },
    },
  });

  const repostingUsers = reposts.map((repost) =>
    mapToUserResponse(repost.user),
  );

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
        ...buildUserSelect(req.user?.id),
      },
    },
  });

  const likingUsers = likes.map((like) => mapToUserResponse(like.user));

  res.json(likingUsers);
};
