import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import {
  createPost,
  getPostById,
  listPosts,
} from "../controllers/postController.ts";
import { validatePost, validatePostId } from "../validators/postValidators.ts";

const postRouter = Router();

postRouter.get("/", listPosts);

postRouter.post("/", requireAuth, validatePost, createPost);

postRouter.get("/:postId", validatePostId, getPostById);

export default postRouter;
