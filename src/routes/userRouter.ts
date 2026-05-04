import { Router } from "express";
import { createUser, listUsers } from "../controllers/userControllers.ts";
import { validateUserCreation } from "../validators/userValidators.ts";

const userRouter = Router();

userRouter.get("/", listUsers);

userRouter.post("/", validateUserCreation, createUser);

export default userRouter;
