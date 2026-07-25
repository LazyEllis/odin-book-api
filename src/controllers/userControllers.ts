import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { prisma } from "../lib/prisma.ts";
import { BadRequestError, NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/auth.ts";
import {
  selectPostFields,
  selectUserFields,
  transformPost,
  transformUser,
} from "../lib/selects.ts";
import { generateGravatarURL } from "../lib/gravatar.ts";

export const listUsers: RequestHandler = async (req, res) => {
  const rawUsers = await prisma.user.findMany({
    ...selectUserFields(req.user?.id),
    orderBy: {
      username: "asc",
    },
  });

  const users = rawUsers.map(transformUser);

  res.json(users);
};

export const createUser: RequestHandler = async (req, res) => {
  const { name, username, password } = req.body;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environmental variables");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const profileImageUrl = generateGravatarURL(username);

  const rawUser = await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      profileImageUrl,
    },
    ...selectUserFields(),
  });

  const user = transformUser(rawUser);

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  res.status(201).json({ user, token });
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const rawUser = await prisma.user.findUnique({
    where: {
      id,
    },
    ...selectUserFields(req.user?.id),
  });

  if (!rawUser) {
    throw new NotFoundError("User not found");
  }

  const user = transformUser(rawUser);

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
    ...selectUserFields(req.user?.id),
  });

  const updatedUser = transformUser(user);

  res.json(updatedUser);
};

export const getUserById: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const rawUser = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
    ...selectUserFields(req.user?.id),
  });

  if (!rawUser) {
    throw new NotFoundError("User not found");
  }

  const user = transformUser(rawUser);

  res.json(user);
};

export const getUserByUsername: RequestHandler = async (req, res) => {
  const { username } = req.params;

  const rawUser = await prisma.user.findFirst({
    where: {
      username: {
        equals: String(username),
        mode: "insensitive",
      },
    },
    ...selectUserFields(req.user?.id),
  });

  if (!rawUser) {
    throw new NotFoundError("User not found");
  }

  const user = transformUser(rawUser);

  res.json(user);
};

export const listCurrentUserPosts: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const rawPosts = await prisma.post.findMany({
    where: {
      authorId: id,
    },
    ...selectPostFields(id),
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = rawPosts.map(transformPost);

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

  const rawPosts = await prisma.post.findMany({
    where: {
      authorId: Number(userId),
    },
    ...selectPostFields(req.user?.id),
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = rawPosts.map(transformPost);

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
        ...selectPostFields(req.user?.id),
      },
    },
    orderBy: {
      likedAt: "desc",
    },
  });

  const likedPosts = likes.map((like) => transformPost(like.post));

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
      followerId: Number(userId),
    },
    select: {
      following: {
        ...selectUserFields(req.user?.id),
      },
    },
  });

  const following = follows.map((follow) => transformUser(follow.following));

  res.json(following);
};

export const listCurrentUserFollowers: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const follows = await prisma.follow.findMany({
    where: {
      followingId: id,
    },
    select: {
      follower: {
        ...selectUserFields(id),
      },
    },
  });

  const followers = follows.map((follow) => transformUser(follow.follower));

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
      followingId: Number(userId),
    },
    select: {
      follower: {
        ...selectUserFields(req.user?.id),
      },
    },
  });

  const followers = follows.map((follow) => transformUser(follow.follower));

  res.json(followers);
};

export const uploadProfileImage: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  if (!req.file) {
    throw new BadRequestError("You must upload an image");
  }

  const { buffer } = req.file;

  const image = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", public_id: `user-${id}`, overwrite: true },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Cloudinary return no URL"));
          return resolve(result);
        },
      )
      .end(buffer);
  });

  const rawUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      profileImageUrl: image.secure_url,
    },
    ...selectUserFields(req.user?.id),
  });

  const updatedUser = transformUser(rawUser);

  res.json(updatedUser);
};
