import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { prisma } from "../config/prisma.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";
import { buildPostSelect, mapToPostResponse } from "../mappers/postMapper.ts";
import { buildUserSelect, mapToUserResponse } from "../mappers/userMapper.ts";
import { BadRequestError, NotFoundError } from "../utils/errors.ts";
import { generateGravatarURL } from "../utils/gravatar.ts";

export const listUsers: RequestHandler = async (req, res) => {
  const rawUsers = await prisma.user.findMany({
    ...buildUserSelect(req.user?.id),
    orderBy: {
      username: "asc",
    },
  });

  const users = rawUsers.map(mapToUserResponse);

  res.json(users);
};

export const createUser: RequestHandler = async (req, res) => {
  const { name, username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const profileImageUrl = generateGravatarURL(username);

  const rawUser = await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      profileImageUrl,
    },
    ...buildUserSelect(),
  });

  const user = mapToUserResponse(rawUser);

  res.status(201).json(user);
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const rawUser = await prisma.user.findUnique({
    where: {
      id,
    },
    ...buildUserSelect(req.user?.id),
  });

  if (!rawUser) {
    throw new NotFoundError("User not found");
  }

  const user = mapToUserResponse(rawUser);

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
    ...buildUserSelect(req.user?.id),
  });

  const updatedUser = mapToUserResponse(user);

  res.json(updatedUser);
};

export const getUserById: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const rawUser = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
    ...buildUserSelect(req.user?.id),
  });

  if (!rawUser) {
    throw new NotFoundError("User not found");
  }

  const user = mapToUserResponse(rawUser);

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
    ...buildUserSelect(req.user?.id),
  });

  if (!rawUser) {
    throw new NotFoundError("User not found");
  }

  const user = mapToUserResponse(rawUser);

  res.json(user);
};

export const listCurrentUserPosts: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const rawPosts = await prisma.post.findMany({
    where: {
      authorId: id,
    },
    ...buildPostSelect(id),
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = rawPosts.map(mapToPostResponse);

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
    ...buildPostSelect(req.user?.id),
    orderBy: {
      createdAt: "desc",
    },
  });

  const posts = rawPosts.map(mapToPostResponse);

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
        ...buildPostSelect(req.user?.id),
      },
    },
    orderBy: {
      likedAt: "desc",
    },
  });

  const likedPosts = likes.map((like) => mapToPostResponse(like.post));

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
        ...buildUserSelect(req.user?.id),
      },
    },
  });

  const following = follows.map((follow) =>
    mapToUserResponse(follow.following),
  );

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
        ...buildUserSelect(id),
      },
    },
  });

  const followers = follows.map((follow) => mapToUserResponse(follow.follower));

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
        ...buildUserSelect(req.user?.id),
      },
    },
  });

  const followers = follows.map((follow) => mapToUserResponse(follow.follower));

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
    ...buildUserSelect(req.user?.id),
  });

  const updatedUser = mapToUserResponse(rawUser);

  res.json(updatedUser);
};
