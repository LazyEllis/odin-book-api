import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.ts";
import { NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/auth.ts";
import { postFields, userFields } from "../lib/selects.ts";

export const listUsers: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany({
    ...userFields,
    orderBy: {
      username: "asc",
    },
  });

  res.json(users);
};

export const createUser: RequestHandler = async (req, res) => {
  const { name, username, password } = req.body;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environmental variables");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
    },
    ...userFields,
  });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(201).json({ user, token });
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    ...userFields,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(user);
};

export const updateCurrentUser: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);
  const { name, username, description, location, url } = req.body;

  const user = await prisma.user.update({
    data: {
      name,
      username,
      description,
      location,
      url,
    },
    where: {
      id,
    },
    ...userFields,
  });

  res.json(user);
};

export const getUserById: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
    ...userFields,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(user);
};

export const getUserByUsername: RequestHandler = async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: String(username),
        mode: "insensitive",
      },
    },
    ...userFields,
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(user);
};

export const listCurrentUserPosts: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const posts = await prisma.post.findMany({
    where: {
      authorId: id,
    },
    ...postFields,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(posts);
};

export const listUserPosts: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: Number(userId),
    },
    ...postFields,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(posts);
};

export const listUserLikes: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const likes = await prisma.like.findMany({
    where: {
      userId: Number(userId),
    },
    select: {
      post: {
        ...postFields,
      },
    },
    orderBy: {
      likedAt: "desc",
    },
  });

  const likedPosts = likes.map((like) => like.post);

  res.json(likedPosts);
};

export const listUserFollowing: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const follows = await prisma.follow.findMany({
    where: {
      followingId: Number(userId),
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

export const listCurrentUserFollowers: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const follows = await prisma.follow.findMany({
    where: {
      followerId: id,
    },
    select: {
      following: {
        ...userFields,
      },
    },
  });

  const followers = follows.map((follow) => follow.following);

  res.json(followers);
};

export const listUserFollowers: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const follows = await prisma.follow.findMany({
    where: {
      followerId: Number(userId),
    },
    select: {
      following: {
        ...userFields,
      },
    },
  });

  const followers = follows.map((follow) => follow.following);

  res.json(followers);
};
