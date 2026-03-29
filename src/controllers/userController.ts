import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.ts";
import type { UserCreate } from "../lib/interfaces.ts";

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
