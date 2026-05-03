import { Router } from "express";
import { createUser } from "../controllers/userControllers.ts";
import { validateUserCreation } from "../validators/userValidators.ts";

const userRouter = Router();

userRouter.post("/", validateUserCreation, createUser);

export default userRouter;
