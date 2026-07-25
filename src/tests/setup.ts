import { afterEach } from "vitest";
import { prisma } from "../config/prisma.ts";
import { redis } from "../config/redis.ts";

afterEach(async () => {
  await prisma.$executeRawUnsafe(
    "TRUNCATE TABLE users, posts, bookmarks, follows, likes, reposts CASCADE;",
  );
  await redis.flushDb();
});
