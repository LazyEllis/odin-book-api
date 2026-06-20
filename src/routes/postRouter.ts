import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import {
  createPost,
  deletePost,
  getPostById,
  listPostQuotes,
  listPostReplies,
  listPostReposters,
  listPosts,
} from "../controllers/postController.ts";
import { validatePost, validatePostId } from "../validators/postValidators.ts";

const postRouter = Router();

postRouter.get("/", listPosts);

postRouter.post("/", requireAuth, validatePost, createPost);

postRouter.get("/:postId", validatePostId, getPostById);

postRouter.delete("/:postId", requireAuth, validatePostId, deletePost);

postRouter.get("/:postId/replies", validatePostId, listPostReplies);

postRouter.get("/:postId/quotes", validatePostId, listPostQuotes);

postRouter.get("/:postId/reposted_by", validatePostId, listPostReposters);

export default postRouter;
