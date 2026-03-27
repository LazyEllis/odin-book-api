import { Router } from "express";
import { createUser } from "../controllers/userController.ts";
import { validateUserCreation } from "../validators/userValidators.ts";

const userRouter = Router();

userRouter.post("/", validateUserCreation, createUser);

export default userRouter;
