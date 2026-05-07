import { Router } from "express";
import { generateToken } from "../controllers/authController.ts";

const authRouter = Router();

authRouter.post("/token", generateToken);

export default authRouter;
