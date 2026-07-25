import { Router } from "express";
import { requireAuth } from "../middlewares/auth.ts";
import { validatePostId } from "../validators/postValidators.ts";
import { repostPost, unrepostPost } from "../controllers/repostController.ts";

const repostRouter = Router();

repostRouter.put("/:postId", requireAuth, validatePostId, repostPost);

repostRouter.delete("/:postId", requireAuth, validatePostId, unrepostPost);

export default repostRouter;
