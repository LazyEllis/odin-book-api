import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import type { UserCreate, UserUpdate } from "../lib/interfaces.ts";
import { prisma } from "../lib/prisma.ts";
import { getRequestUser } from "../lib/utils.ts";
import { NotFoundError } from "../lib/errors.ts";

export const listUsers: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany({
    omit: {
      password: true,
    },
    include: {
      _count: {
        select: {
          following: true,
          followers: true,
        },
      },
    },
    orderBy: [
      {
        followers: {
          _count: "asc",
        },
      },
      {
        name: "asc",
      },
      {
        username: "asc",
      },
    ],
  });

  res.json(users);
};

export const createUser: RequestHandler = async (req, res) => {
  const { name, username, password }: UserCreate = req.body;

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
          following: true,
          followers: true,
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
  const { id } = getRequestUser(req.user);

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
          following: true,
          followers: true,
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
          following: true,
          followers: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  res.json(user);
};

export const getUserByUsername: RequestHandler = async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username.toString(),
        mode: "insensitive",
      },
    },
    omit: {
      password: true,
    },
    include: {
      _count: {
        select: {
          following: true,
          followers: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  res.json(user);
};

export const updateCurrentUserProfile: RequestHandler = async (req, res) => {
  const { id } = getRequestUser(req.user);
  const { name, username, description, location, url }: UserUpdate = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      username,
      description,
      location,
      url,
    },
    omit: {
      password: true,
    },
    include: {
      _count: {
        select: {
          following: true,
          followers: true,
        },
      },
    },
  });

  res.json(updatedUser);
};
