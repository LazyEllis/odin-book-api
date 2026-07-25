import crypto from "node:crypto";
import type { RequestHandler } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import type { IVerifyOptions } from "passport-local";
import { redis } from "../config/redis.ts";
import { UnauthorizedError } from "../utils/errors.ts";
import { getAuthenticatedUser } from "../middlewares/auth.ts";

export const generateLocalAuthToken: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: never, user: Express.User, info: IVerifyOptions) => {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environmental variables");
      }

      if (err) {
        return next(err);
      }

      if (!user) {
        throw new UnauthorizedError(info.message);
      }

      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({ token });
    },
  )(req, res, next);
};

export const handleGithubCallback: RequestHandler = async (req, res) => {
  const { id } = getAuthenticatedUser(req.user);

  const code = crypto.randomUUID();

  await redis.set(`oauth:${code}`, JSON.stringify({ id }), {
    expiration: { type: "EX", value: 60 },
  });

  res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?code=${code}`);
};

export const generateOAuthToken: RequestHandler = async (req, res) => {
  const { code } = req.body;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environmental variables");
  }

  const cachedUser = await redis.get(`oauth:${code}`);

  if (!cachedUser) {
    throw new UnauthorizedError(
      "The verification code is invalid or has expired",
    );
  }

  const user = await JSON.parse(cachedUser);

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  await redis.del(`oauth:${code}`);

  res.json({ token });
};
