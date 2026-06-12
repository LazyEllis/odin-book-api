import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import { validatePostId } from "../validators/postValidators.ts";
import { pinPost, unpinPost } from "../controllers/pinnedPostController.ts";

const pinnedPostRouter = Router();

pinnedPostRouter.put("/:postId", requireAuth, validatePostId, pinPost);

pinnedPostRouter.delete("/:postId", requireAuth, validatePostId, unpinPost);

export default pinnedPostRouter;
