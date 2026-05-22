import { Router } from "express";
import { requireAuth } from "../lib/auth.ts";
import { createPost } from "../controllers/postController.ts";
import { validatePost } from "../validators/postValidators.ts";

const postRouter = Router();

postRouter.post("/", requireAuth, validatePost, createPost);

export default postRouter;
