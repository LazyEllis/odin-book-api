import multer from "multer";
import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import {
  validateProfileImage,
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
  uploadProfileImage,
} from "../controllers/userControllers.ts";

const userRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });

userRouter.get("/", listUsers);

userRouter.post("/", validateUserCreation, createUser);

userRouter.get("/me", requireAuth, getCurrentUser);

userRouter.put("/me", requireAuth, validateUserUpdate, updateCurrentUser);

userRouter.get("/me/posts", requireAuth, listCurrentUserPosts);

userRouter.get("/me/followers", requireAuth, listCurrentUserFollowers);

userRouter.put(
  "/me/profile_image",
  requireAuth,
  upload.single("profile_image"),
  validateProfileImage,
  uploadProfileImage,
);

userRouter.get("/:userId", validateUserId, getUserById);

userRouter.get("/:userId/posts", validateUserId, listUserPosts);

userRouter.get("/:userId/likes", validateUserId, listUserLikes);

userRouter.get("/:userId/following", validateUserId, listUserFollowing);

userRouter.get("/:userId/followers", validateUserId, listUserFollowers);

userRouter.get("/by/username/:username", getUserByUsername);

export default userRouter;
