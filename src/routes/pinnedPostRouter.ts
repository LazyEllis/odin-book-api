import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import { validatePostId } from "../validators/postValidators.ts";
import { pinPost } from "../controllers/pinnedPostController.ts";

const pinnedPostRouter = Router();

pinnedPostRouter.put("/:postId", requireAuth, validatePostId, pinPost);

export default pinnedPostRouter;
