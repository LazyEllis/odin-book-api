import { Router } from "express";
import {
  createUser,
  getUserById,
  getUserByUsername,
  listUsers,
} from "../controllers/userControllers.ts";
import {
  validateUserCreation,
  validateUserId,
} from "../validators/userValidators.ts";

const userRouter = Router();

userRouter.get("/", listUsers);

userRouter.post("/", validateUserCreation, createUser);

userRouter.get("/:userId", validateUserId, getUserById);

userRouter.get("/by/username/:username", getUserByUsername);

export default userRouter;
