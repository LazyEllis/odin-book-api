import multer from "multer";
import { Router } from "express";
import { optionalAuth, requireAuth } from "../middlewares/auth.ts";
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

userRouter.get("/", optionalAuth, listUsers);

userRouter.post("/", optionalAuth, validateUserCreation, createUser);

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

userRouter.get("/:userId", optionalAuth, validateUserId, getUserById);

userRouter.get("/:userId/posts", optionalAuth, validateUserId, listUserPosts);

userRouter.get("/:userId/likes", optionalAuth, validateUserId, listUserLikes);

userRouter.get(
  "/:userId/following",
  optionalAuth,
  validateUserId,
  listUserFollowing,
);

userRouter.get(
  "/:userId/followers",
  optionalAuth,
  validateUserId,
  listUserFollowers,
);

userRouter.get("/by/username/:username", optionalAuth, getUserByUsername);

export default userRouter;
