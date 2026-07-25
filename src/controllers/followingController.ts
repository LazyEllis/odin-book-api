import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.ts";
import { NotFoundError } from "../utils/errors.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";
import { selectUserFields, transformUser } from "../utils/selects.ts";

export const listCurrentUserFollowing: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const follows = await prisma.follow.findMany({
    where: {
      followerId: id,
    },
    select: {
      following: {
        ...selectUserFields(id),
      },
    },
  });

  const following = follows.map((follow) => transformUser(follow.following));

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
      followerId: id,
      followingId: Number(userId),
    },
    update: {},
    where: {
      followerId_followingId: {
        followerId: id,
        followingId: Number(userId),
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
        followerId: id,
        followingId: Number(userId),
      },
    },
  });

  if (!follow) {
    return res.status(204).end();
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: id,
        followingId: Number(userId),
      },
    },
  });

  res.status(204).end();
};
