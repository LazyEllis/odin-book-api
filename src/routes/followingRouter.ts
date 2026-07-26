import { Router } from "express";
import { requireAuth } from "../middlewares/auth.ts";
import { validateUserId } from "../validators/followingValidators.ts";
import {
  followUser,
  listCurrentUserFollowing,
  listCurrentUserFollowingPosts,
  unfollowUser,
} from "../controllers/followingController.ts";

const followingRouter = Router();

followingRouter.get("/", requireAuth, listCurrentUserFollowing);

followingRouter.put("/:userId", requireAuth, validateUserId, followUser);

followingRouter.delete("/:userId", requireAuth, validateUserId, unfollowUser);

followingRouter.get("/posts", requireAuth, listCurrentUserFollowingPosts);

export default followingRouter;
