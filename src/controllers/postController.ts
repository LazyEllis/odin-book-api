import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { getAuthenticatedUser } from "../lib/utils.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";

export const listPosts: RequestHandler = async (req, res) => {
  const posts = await prisma.post.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(posts);
};

export const createPost: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { text, inReplyToPostId, quotedPostId } = req.body;

  const user = await prisma.post.create({
    data: {
      text,
      authorId: id,
      inReplyToPostId,
      quotedPostId,
    },
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
  });

  res.status(201).json(user);
};

export const getPostById: RequestHandler = async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
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
