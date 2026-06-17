import express from "express";
import cors from "cors";
import "dotenv/config";
import "./lib/passport.ts";
import { errorHandler } from "./lib/errorHandler.ts";
import userRouter from "./routes/userRouter.ts";
import authRouter from "./routes/authRouter.ts";
import postRouter from "./routes/postRouter.ts";
import pinnedPostRouter from "./routes/pinnedPostRouter.ts";
import bookmarkRouter from "./routes/bookmarkRouter.ts";
import repostRouter from "./routes/repostRouter.ts";

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use("/users", userRouter);
app.use("/users/me/pinned_post", pinnedPostRouter);
app.use("/users/me/bookmarks", bookmarkRouter);
app.use("/users/me/reposts", repostRouter);
app.use("/auth", authRouter);
app.use("/posts", postRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
