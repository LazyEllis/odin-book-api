import { Router } from "express";
import { optionalAuth, requireAuth } from "../lib/auth.ts";
import {
  createPost,
  deletePost,
  getPostById,
  listPostLikers,
  listPostQuotes,
  listPostReplies,
  listPostReposters,
  listPosts,
} from "../controllers/postController.ts";
import { validatePost, validatePostId } from "../validators/postValidators.ts";

const postRouter = Router();

postRouter.get("/", optionalAuth, listPosts);

postRouter.post("/", requireAuth, validatePost, createPost);

postRouter.get("/:postId", optionalAuth, validatePostId, getPostById);

postRouter.delete("/:postId", requireAuth, validatePostId, deletePost);

postRouter.get(
  "/:postId/replies",
  optionalAuth,
  validatePostId,
  listPostReplies,
);

postRouter.get("/:postId/quotes", optionalAuth, validatePostId, listPostQuotes);

postRouter.get(
  "/:postId/reposted_by",
  optionalAuth,
  validatePostId,
  listPostReposters,
);

postRouter.get(
  "/:postId/liking_users",
  optionalAuth,
  validatePostId,
  listPostLikers,
);

export default postRouter;
