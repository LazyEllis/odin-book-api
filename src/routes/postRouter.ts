import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import {
  createPost,
  deletePost,
  getPostById,
  listPosts,
} from "../controllers/postController.ts";
import { validatePost, validatePostId } from "../validators/postValidators.ts";

const postRouter = Router();

postRouter.get("/", listPosts);

postRouter.post("/", requireAuth, validatePost, createPost);

postRouter.get("/:postId", validatePostId, getPostById);

postRouter.delete("/:postId", requireAuth, validatePostId, deletePost);

export default postRouter;
