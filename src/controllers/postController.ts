import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { getAuthenticatedUser } from "../lib/utils.ts";

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
