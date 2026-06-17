import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { createUser } from "../tests/fixtures.ts";

describe("GET /users/me/bookmarks", () => {
  it("returns all bookmarked posts on success", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has been bookmarked" });

    await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is a regular post" });

    await request(app)
      .put(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    const res = await request(app)
      .get("/users/me/bookmarks")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        text: "This post has been bookmarked",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
        pinnedById: null,
        conversationId: null,
        repliedTo: null,
        quotedPost: null,
        _count: {
          reposts: 0,
          replies: 0,
          likes: 0,
          quotes: 0,
          bookmarks: 1,
        },
      },
    ]);
  });
});

describe("PUT /users/me/bookmarks/:postId", () => {
  it("bookmarks a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const bookmarkedPostRes = await request(app).get(
      `/posts/${postRes.body.id}`,
    );

    expect(bookmarkedPostRes.body._count.bookmarks).toBe(1);
  });

  it("is idempotent when bookmarking an already bookmarked post", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    await request(app)
      .put(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const pinnedPostRes = await request(app).get(`/posts/${postRes.body.id}`);

    expect(pinnedPostRes.body._count.bookmarks).toBe(1);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .put("/users/me/bookmarks/1.5")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    const { token } = await createUser();

    await request(app)
      .put("/users/me/bookmarks/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .put("/users/me/bookmarks/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("DELETE /users/me/bookmarks/:postId", () => {
  it("removes a bookmark from a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .delete(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const bookmarkedPostRes = await request(app).get(
      `/posts/${postRes.body.id}`,
    );

    expect(bookmarkedPostRes.body._count.bookmarks).toBe(0);
  });

  it("is idempotent when removing a bookmark from a post that hasn't been bookmarked", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .delete(`/users/me/bookmarks/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const pinnedPostRes = await request(app).get(`/posts/${postRes.body.id}`);

    expect(pinnedPostRes.body._count.bookmarks).toBe(0);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .delete("/users/me/bookmarks/1.5")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    const { token } = await createUser();

    await request(app)
      .delete("/users/me/bookmarks/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .delete("/users/me/bookmarks/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});
