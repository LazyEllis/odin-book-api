import { Router } from "express";
import {
  createUser,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  listCurrentUserPosts,
  listUserPosts,
  listUsers,
  updateCurrentUser,
} from "../controllers/userControllers.ts";
import { requireAuth } from "../lib/auth.ts";
import {
  validateUserCreation,
  validateUserId,
  validateUserUpdate,
} from "../validators/userValidators.ts";

const userRouter = Router();

userRouter.get("/", listUsers);

userRouter.post("/", validateUserCreation, createUser);

userRouter.get("/me", requireAuth, getCurrentUser);

userRouter.put("/me", requireAuth, validateUserUpdate, updateCurrentUser);

userRouter.get("/me/posts", requireAuth, listCurrentUserPosts);

userRouter.get("/:userId", validateUserId, getUserById);

userRouter.get("/:userId/posts", validateUserId, listUserPosts);

userRouter.get("/by/username/:username", getUserByUsername);

export default userRouter;
