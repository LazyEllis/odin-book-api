import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { prisma } from "./prisma.ts";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
      });
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const matches = await bcrypt.compare(password, user.password);
      if (!matches) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, { id: user.id });
    } catch (error) {
      done(error);
    }
  }),
);
