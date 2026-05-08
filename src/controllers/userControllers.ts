import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.ts";
import { NotFoundError } from "../lib/errors.ts";
import { getAuthenticatedUser } from "../lib/utils.ts";

export const listUsers: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany({
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

  res.json(user);
};

export const getUserById: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
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

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json(user);
};
