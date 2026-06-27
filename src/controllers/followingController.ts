import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { getAuthenticatedUser } from "../lib/utils.ts";
import { NotFoundError } from "../lib/errors.ts";

export const listCurrentUserFollowing: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const following = await prisma.user.findMany({
    where: {
      followers: {
        some: {
          followingId: id,
        },
      },
    },
    omit: {
      password: true,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  res.json(following);
};

export const followUser: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  await prisma.follow.upsert({
    create: {
      followerId: Number(userId),
      followingId: id,
    },
    update: {},
    where: {
      followerId_followingId: {
        followerId: Number(userId),
        followingId: id,
      },
    },
  });

  res.status(204).end();
};

export const unfollowUser: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: Number(userId),
        followingId: id,
      },
    },
  });

  if (!follow) {
    return res.status(204).end();
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: Number(userId),
        followingId: id,
      },
    },
  });

  res.status(204).end();
};
