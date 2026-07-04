import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "./prisma.ts";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environmental variables");
}

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

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt_payload, done) => {
      try {
        return done(null, { id: jwt_payload.sub });
      } catch (error) {
        done(error);
      }
    },
  ),
);
