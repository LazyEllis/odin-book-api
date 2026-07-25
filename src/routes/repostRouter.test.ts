import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { createUser } from "../tests/fixtures.ts";

describe("PUT /users/me/reposts/:postId", () => {
  it("reposts a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has been reposted" });

    await request(app)
      .put(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const repostedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(repostedPostRes.body._count.reposts).toBe(1);
    expect(repostedPostRes.body.interactionStatus.isReposted).toBe(true);
  });

  it("is idempotent", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has been reposted" });

    await request(app)
      .put(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    await request(app)
      .put(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const repostedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(repostedPostRes.body._count.reposts).toBe(1);
    expect(repostedPostRes.body.interactionStatus.isReposted).toBe(true);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .put("/users/me/reposts/1.5")
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
      .put("/users/me/reposts/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .put("/users/me/reposts/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("DELETE /users/me/reposts/:postId", () => {
  it("unreposts a repost on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has been reposted" });

    await request(app)
      .put(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .delete(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const repostedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(repostedPostRes.body._count.reposts).toBe(0);
    expect(repostedPostRes.body.interactionStatus.isReposted).toBe(false);
  });

  it("is idempotent", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has not been reposted" });

    await request(app)
      .delete(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const repostedPostRes = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    expect(repostedPostRes.body._count.reposts).toBe(0);
    expect(repostedPostRes.body.interactionStatus.isReposted).toBe(false);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .delete("/users/me/reposts/1.5")
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
      .delete("/users/me/reposts/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .delete("/users/me/reposts/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});
