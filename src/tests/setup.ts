import { afterEach } from "vitest";
import { prisma } from "../lib/prisma.ts";

afterEach(async () => {
  await prisma.$executeRawUnsafe(
    "TRUNCATE TABLE users, posts, bookmarks, follows, likes, reposts CASCADE;",
  );
});
