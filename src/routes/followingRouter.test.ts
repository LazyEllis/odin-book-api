import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { createUser } from "../tests/fixtures.ts";

describe("GET /users/me/following", () => {
  it("returns a list of users that the authenticated user follows on success", async () => {
    const { token } = await createUser();
    const { user: firstUser } = await createUser({ username: "jane_doe" });
    const { user: secondUser } = await createUser({ username: "jake_ryan" });

    await request(app)
      .put(`/users/me/following/${firstUser.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .put(`/users/me/following/${secondUser.id}`)
      .auth(token, { type: "bearer" });

    const res = await request(app)
      .get("/users/me/following")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        { ...firstUser, _count: { ...firstUser._count, followers: 1 } },
        { ...secondUser, _count: { ...secondUser._count, followers: 1 } },
      ]),
    );
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .get("/users/me/following")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("PUT /users/me/following/:userId", () => {
  it("follows a user on success", async () => {
    const { user, token } = await createUser();
    const { user: followedUser } = await createUser({ username: "jane_doe" });

    await request(app)
      .put(`/users/me/following/${followedUser.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const res = await request(app).get(`/users/${user.id}`);
    const followedUserRes = await request(app).get(`/users/${followedUser.id}`);

    expect(res.body._count.following).toBe(1);
    expect(followedUserRes.body._count.followers).toBe(1);
  });

  it("is idempotent when following an already followed user", async () => {
    const { user, token } = await createUser();
    const { user: followedUser } = await createUser({ username: "jane_doe" });

    await request(app)
      .put(`/users/me/following/${followedUser.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    await request(app)
      .put(`/users/me/following/${followedUser.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const res = await request(app).get(`/users/${user.id}`);
    const followedUserRes = await request(app).get(`/users/${followedUser.id}`);

    expect(res.body._count.following).toBe(1);
    expect(followedUserRes.body._count.followers).toBe(1);
  });

  it("returns a 422 error if the user ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .put(`/users/me/following/1.5`)
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });

  it("returns a 422 error if the user ID belongs to the authenticated user", async () => {
    const { user, token } = await createUser();

    const res = await request(app)
      .put(`/users/me/following/${user.id}`)
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });

  it("returns a 404 error if the user doesn't exist", async () => {
    const { token } = await createUser();

    await request(app)
      .put("/users/me/following/0")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .put("/users/me/following/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("DELETE /users/me/following/:userId", () => {
  it("unfollows a user on success", async () => {
    const { user, token } = await createUser();
    const { user: followedUser } = await createUser({ username: "jane_doe" });

    await request(app)
      .put(`/users/me/following/${followedUser.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    await request(app)
      .delete(`/users/me/following/${followedUser.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const res = await request(app).get(`/users/${user.id}`);
    const followedUserRes = await request(app).get(`/users/${followedUser.id}`);

    expect(res.body._count.following).toBe(0);
    expect(followedUserRes.body._count.followers).toBe(0);
  });

  it("is idempotent when unfollowing an user than hasn't been followed", async () => {
    const { user, token } = await createUser();
    const { user: followedUser } = await createUser({ username: "jane_doe" });

    await request(app)
      .delete(`/users/me/following/${followedUser.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    const res = await request(app).get(`/users/${user.id}`);
    const followedUserRes = await request(app).get(`/users/${followedUser.id}`);

    expect(res.body._count.following).toBe(0);
    expect(followedUserRes.body._count.followers).toBe(0);
  });

  it("returns a 422 error if the user ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .delete(`/users/me/following/1.5`)
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });

  it("returns a 422 error if the user ID belongs to the authenticated user", async () => {
    const { user, token } = await createUser();

    const res = await request(app)
      .delete(`/users/me/following/${user.id}`)
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });

  it("returns a 404 error if the user doesn't exist", async () => {
    const { token } = await createUser();

    await request(app)
      .delete("/users/me/following/0")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .delete("/users/me/following/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});
