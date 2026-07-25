import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { createUser } from "../tests/fixtures.ts";

describe("GET /users/me/likes", () => {
  it("returns all liked posts on success", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has been liked" });

    await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is a regular post" });

    await request(app)
      .put(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    const res = await request(app)
      .get("/users/me/likes")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        text: "This post has been liked",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
        conversationId: null,
        repliedTo: null,
        quotedPost: null,
        _count: {
          reposts: 0,
          replies: 0,
          likes: 1,
          quotes: 0,
          bookmarks: 0,
        },
        interactionStatus: {
          isLiked: true,
          isReposted: false,
          isBookmarked: false,
        },
      },
    ]);
  });
});

describe("PUT /users/me/likes/:postId", () => {
  it("likes a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const likedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(likedPostRes.body._count.likes).toBe(1);
    expect(likedPostRes.body.interactionStatus.isLiked).toBe(true);
  });

  it("is idempotent when liking an already liked post", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    await request(app)
      .put(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const likedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(likedPostRes.body._count.likes).toBe(1);
    expect(likedPostRes.body.interactionStatus.isLiked).toBe(true);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .put("/users/me/likes/1.5")
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
      .put("/users/me/likes/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .put("/users/me/likes/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("DELETE /users/me/likes/:postId", () => {
  it("unlikes a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .delete(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const likedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(likedPostRes.body._count.likes).toBe(0);
    expect(likedPostRes.body.interactionStatus.isLiked).toBe(false);
  });

  it("is idempotent when unliking a post that hasn't been liked", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .delete(`/users/me/likes/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const likedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(likedPostRes.body._count.likes).toBe(0);
    expect(likedPostRes.body.interactionStatus.isLiked).toBe(false);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .delete("/users/me/likes/1.5")
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
      .delete("/users/me/likes/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .delete("/users/me/likes/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});
