import { Router } from "express";
import passport from "passport";
import {
  generateLocalAuthToken,
  generateOAuthToken,
  handleGithubCallback,
} from "../controllers/authController.ts";

const authRouter = Router();

authRouter.post("/token", generateLocalAuthToken);

authRouter.get(
  "/github",
  passport.authenticate("github", { session: false, scope: ["user:email"] }),
);

authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  handleGithubCallback,
);

authRouter.post("/exchange", generateOAuthToken);

export default authRouter;
