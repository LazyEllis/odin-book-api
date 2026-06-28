import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import {
  validateUserCreation,
  validateUserId,
  validateUserUpdate,
} from "../validators/userValidators.ts";
import {
  createUser,
  getCurrentUser,
  getUserById,
  getUserByUsername,
  listCurrentUserFollowers,
  listCurrentUserPosts,
  listUserFollowers,
  listUserFollowing,
  listUserLikes,
  listUserPosts,
  listUsers,
  updateCurrentUser,
} from "../controllers/userControllers.ts";

const userRouter = Router();

userRouter.get("/", listUsers);

userRouter.post("/", validateUserCreation, createUser);

userRouter.get("/me", requireAuth, getCurrentUser);

userRouter.put("/me", requireAuth, validateUserUpdate, updateCurrentUser);

userRouter.get("/me/posts", requireAuth, listCurrentUserPosts);

userRouter.get("/me/followers", requireAuth, listCurrentUserFollowers);

userRouter.get("/:userId", validateUserId, getUserById);

userRouter.get("/:userId/posts", validateUserId, listUserPosts);

userRouter.get("/:userId/likes", validateUserId, listUserLikes);

userRouter.get("/:userId/following", validateUserId, listUserFollowing);

userRouter.get("/:userId/followers", validateUserId, listUserFollowers);

userRouter.get("/by/username/:username", getUserByUsername);

export default userRouter;
