import "dotenv/config";
import { afterEach } from "vitest";
import { prisma } from "../lib/prisma.ts";

afterEach(async () => {
  const deletePosts = prisma.post.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([deletePosts, deleteUsers]);
});
