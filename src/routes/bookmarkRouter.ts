import { Router } from "express";
import { requireAuth } from "../middlewares/auth.ts";
import { validatePostId } from "../validators/postValidators.ts";
import {
  bookmarkPost,
  listBookmarks,
  removePostBookmark,
} from "../controllers/bookmarkController.ts";

const bookmarkRouter = Router();

bookmarkRouter.get("/", requireAuth, listBookmarks);

bookmarkRouter.put("/:postId", requireAuth, validatePostId, bookmarkPost);

bookmarkRouter.delete(
  "/:postId",
  requireAuth,
  validatePostId,
  removePostBookmark,
);

export default bookmarkRouter;
