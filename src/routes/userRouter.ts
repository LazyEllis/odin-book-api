import { Router } from "express";
import {
  createUser,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  listUsers,
  updateCurrentUserProfile,
} from "../controllers/userController.ts";
import {
  validateUserCreation,
  validateUserUpdate,
} from "../validators/userValidators.ts";
import { requireAuth } from "../lib/auth.ts";

const userRouter = Router();

userRouter.get("/", listUsers);

userRouter.post("/", validateUserCreation, createUser);

userRouter.get("/me", requireAuth, getCurrentUser);

userRouter.put(
  "/me",
  requireAuth,
  validateUserUpdate,
  updateCurrentUserProfile,
);

userRouter.get("/:userId", getUserById);

userRouter.get("/by/username/:username", getUserByUsername);

export default userRouter;
