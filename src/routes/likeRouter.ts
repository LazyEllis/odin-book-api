import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import { validatePostId } from "../validators/postValidators.ts";
import {
  likePost,
  listCurrentUserLikes,
  unlikePost,
} from "../controllers/likeController.ts";

const likeRouter = Router();

likeRouter.get("/", requireAuth, listCurrentUserLikes);

likeRouter.put("/:postId", requireAuth, validatePostId, likePost);

likeRouter.delete("/:postId", requireAuth, validatePostId, unlikePost);

export default likeRouter;
