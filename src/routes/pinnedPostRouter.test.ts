import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { createUser } from "../tests/fixtures.ts";

describe("PUT /users/me/pinned_post/:postId", () => {
  it("pins a post on success", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const pinnedPostRes = await request(app).get(`/posts/${postRes.body.id}`);

    expect(pinnedPostRes.body.pinnedById).toBe(user.id);
  });

  it("replaces the previously pinned post when pinning a new one", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    const otherPostRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my another post." });

    await request(app)
      .put(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .put(`/users/me/pinned_post/${otherPostRes.body.id}`)
      .auth(token, { type: "bearer" });

    const updatedPostRes = await request(app).get(`/posts/${postRes.body.id}`);

    const updatedOtherPostRes = await request(app).get(
      `/posts/${otherPostRes.body.id}`,
    );

    expect(updatedPostRes.body.pinnedById).toBeNull();
    expect(updatedOtherPostRes.body.pinnedById).toBe(user.id);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .put("/users/me/pinned_post/1.5")
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
      .put("/users/me/pinned_post/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 403 error if the post is authored by another user", async () => {
    const { token } = await createUser();
    const { token: janeToken } = await createUser({ username: "jane_doe" });

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(janeToken, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "You don't have permission to pin this post" })
      .expect(403);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .put("/users/me/pinned_post/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("DELETE /users/me/pinned_post/:postId", () => {
  it("unpins a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .put(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .delete(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const pinnedPostRes = await request(app).get(`/posts/${postRes.body.id}`);

    expect(pinnedPostRes.body.pinnedById).toBeNull();
  });

  it("is idempotent when unpinning an already unpinned post", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .delete(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const pinnedPostRes = await request(app).get(`/posts/${postRes.body.id}`);

    expect(pinnedPostRes.body.pinnedById).toBeNull();
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .delete("/users/me/pinned_post/1.5")
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
      .delete("/users/me/pinned_post/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 403 error if the post is authored by another user", async () => {
    const { token } = await createUser();
    const { token: janeToken } = await createUser({ username: "jane_doe" });

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .delete(`/users/me/pinned_post/${postRes.body.id}`)
      .auth(janeToken, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "You don't have permission to unpin this post" })
      .expect(403);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .delete("/users/me/pinned_post/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});
