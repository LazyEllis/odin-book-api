import passport from "passport";
import { UnauthorizedError } from "./errors.ts";

export const requireAuth = passport.authenticate("jwt", {
  session: false,
  failWithError: true,
});

export const getAuthenticatedUser = (user: Express.User | undefined) => {
  if (!user) {
    throw new UnauthorizedError("Unauthorized");
  }

  return user;
};
