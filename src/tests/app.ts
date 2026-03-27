import express from "express";
import cors from "cors";
import "dotenv/config";
import { errorHandler } from "../lib/utils.ts";
import userRouter from "../routes/userRouter.ts";

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use("/users", userRouter);

app.use(errorHandler);

export default app;
