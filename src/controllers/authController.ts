import type { RequestHandler } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../lib/errors.ts";
import type { IVerifyOptions } from "passport-local";

export const generateToken: RequestHandler = (req, res, next) => {
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
