import { beforeEach } from "vitest";
import { prisma } from "../lib/prisma.ts";

beforeEach(async () => {
  const deleteLikes = prisma.like.deleteMany();
  const deleteBookmarks = prisma.bookmark.deleteMany();
  const deleteReposts = prisma.repost.deleteMany();
  const deleteFollows = prisma.follow.deleteMany();
  const deletePosts = prisma.post.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteLikes,
    deleteBookmarks,
    deleteReposts,
    deleteFollows,
    deletePosts,
    deleteUsers,
  ]);
});
