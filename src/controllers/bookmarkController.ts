import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/auth.ts";
import { selectPostFields, transformPost } from "../lib/selects.ts";

export const listBookmarks: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: id,
    },
    select: {
      post: {
        ...selectPostFields(id),
      },
    },
    orderBy: {
      bookmarkedAt: "desc",
    },
  });

  const bookmarkedPosts = bookmarks.map((bookmark) =>
    transformPost(bookmark.post),
  );

  res.json(bookmarkedPosts);
};

export const bookmarkPost: RequestHandler = async (req, res) => {
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

  await prisma.bookmark.upsert({
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

export const removePostBookmark: RequestHandler = async (req, res) => {
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

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  if (!bookmark) {
    return res.status(204).end();
  }

  await prisma.bookmark.delete({
    where: {
      userId_postId: {
        userId: id,
        postId: Number(postId),
      },
    },
  });

  res.status(204).end();
};
