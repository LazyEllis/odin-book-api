import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import { validateUserId } from "../validators/followingValidators.ts";
import {
  followUser,
  listCurrentUserFollowing,
  unfollowUser,
} from "../controllers/followingController.ts";

const followingRouter = Router();

followingRouter.get("/", requireAuth, listCurrentUserFollowing);

followingRouter.put("/:userId", requireAuth, validateUserId, followUser);

followingRouter.delete("/:userId", requireAuth, validateUserId, unfollowUser);

export default followingRouter;
