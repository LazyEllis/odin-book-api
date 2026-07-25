import { afterEach } from "vitest";
import { prisma } from "../lib/prisma.ts";
import { redis } from "../lib/redis.ts";

afterEach(async () => {
  await prisma.$executeRawUnsafe(
    "TRUNCATE TABLE users, posts, bookmarks, follows, likes, reposts CASCADE;",
  );
  await redis.flushDb();
});
