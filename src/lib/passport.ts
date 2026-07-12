import crypto from "node:crypto";
import passport, { type DoneCallback } from "passport";
import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GitHubStrategy, type Profile } from "passport-github2";
import { prisma } from "./prisma.ts";

interface GitHubProfile extends Profile {
  displayName: string;
  username: string;
  photos: [{ value: string }];
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environmental variables");
}

if (!process.env.GITHUB_CLIENT_ID) {
  throw new Error("JWT_SECRET is not defined in environmental variables");
}

if (!process.env.GITHUB_CLIENT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environmental variables");
}

// Adds a suffix to a GitHub username when the username is already occupied in the DB.
const generateUsername = (username: string) => {
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${username}_${suffix}`;
};

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
      if (!user || !user.password) {
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

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: DoneCallback,
    ) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            githubId: Number(profile.id),
          },
        });
        if (existingUser) {
          return done(null, existingUser);
        }

        const usernameExists = await prisma.user.findFirst({
          where: {
            username: {
              equals: profile.username,
              mode: "insensitive",
            },
          },
        });

        const username = usernameExists
          ? generateUsername(profile.username)
          : profile.username;

        const user = await prisma.user.create({
          data: {
            name: profile.displayName || profile.username,
            username,
            profileImageUrl: profile.photos[0].value,
            url: profile.profileUrl,
            githubId: Number(profile.id),
          },
        });

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);
