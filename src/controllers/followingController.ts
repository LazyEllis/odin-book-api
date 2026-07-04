import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import { NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/auth.ts";
import { userFields } from "../lib/selects.ts";

export const listCurrentUserFollowing: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const follows = await prisma.follow.findMany({
    where: {
      followingId: id,
    },
    select: {
      follower: {
        ...userFields,
      },
    },
  });

  const following = follows.map((follow) => follow.follower);

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
