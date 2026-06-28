import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { userCreationPayload, userUpdatePayload } from "../tests/fixtures.ts";
import { createUser } from "../tests/fixtures.ts";

describe("POST /users", () => {
  it("returns the created user with a token on success", async () => {
    const res = await request(app)
      .post("/users")
      .send(userCreationPayload)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
      user: {
        id: expect.any(Number),
        name: userCreationPayload.name,
        username: userCreationPayload.username,
        createdAt: expect.any(String),
        description: null,
        location: null,
        profileImageUrl: null,
        url: null,
        _count: {
          followers: 0,
          following: 0,
        },
      },
      token: expect.any(String),
    });
    expect(Date.parse(res.body.user.createdAt)).not.toBeNaN();
  });

  it("returns a 422 error when fields are empty", async () => {
    const res = await request(app)
      .post("/users")
      .send({})
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "username" }),
        expect.objectContaining({ path: "password" }),
      ]),
    });
  });

  it("returns a 422 error when name exceeds 50 characters", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        ...userCreationPayload,
        name: "Has Erling Braut Haaland Broken Another Goalscoring Record?",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
      ]),
    });
  });

  it("returns a 422 error when username is less than 5 characters", async () => {
    const res = await request(app)
      .post("/users")
      .send({ ...userCreationPayload, username: "john" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username exceeds 15 characters", async () => {
    const res = await request(app)
      .post("/users")
      .send({ ...userCreationPayload, username: "jonathan_mcdonald" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username contains spaces", async () => {
    const res = await request(app)
      .post("/users")
      .send({ ...userCreationPayload, username: "john doe" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username contains invalid special characters", async () => {
    const res = await request(app)
      .post("/users")
      .send({ ...userCreationPayload, username: "john.doe" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username is already taken", async () => {
    await request(app)
      .post("/users")
      .send(userCreationPayload)
      .expect("Content-Type", /json/)
      .expect(201);

    const res = await request(app)
      .post("/users")
      .send({
        ...userCreationPayload,
        name: "Jonathan Doe",
        username: "JOHN_DOE_123",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when password does not meet strength requirements", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        ...userCreationPayload,
        password: "password",
        passwordConfirmation: "password",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "password" }),
      ]),
    });
  });

  it("returns a 422 error when password and passwordConfirmation do not match", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        ...userCreationPayload,
        password: "Password123!",
        passwordConfirmation: "Password@123",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "passwordConfirmation" }),
      ]),
    });
  });
});

describe("GET /users", () => {
  it("returns all created users", async () => {
    await request(app).post("/users").send(userCreationPayload);

    await request(app)
      .post("/users")
      .send({ ...userCreationPayload, name: "Jane Doe", username: "jane_doe" });

    const res = await request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          name: userCreationPayload.name,
          username: userCreationPayload.username,
          createdAt: expect.any(String),
          description: null,
          location: null,
          profileImageUrl: null,
          url: null,
          _count: {
            followers: 0,
            following: 0,
          },
        },
        {
          id: expect.any(Number),
          name: "Jane Doe",
          username: "jane_doe",
          createdAt: expect.any(String),
          description: null,
          location: null,
          profileImageUrl: null,
          url: null,
          _count: {
            followers: 0,
            following: 0,
          },
        },
      ]),
    );
  });
});

describe("GET /users/me", () => {
  it("returns the authenticated user on success", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .get("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: userCreationPayload.name,
      username: userCreationPayload.username,
      createdAt: expect.any(String),
      description: null,
      location: null,
      profileImageUrl: null,
      url: null,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns a 401 error if no token is provided", async () => {
    await request(app)
      .get("/users/me")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });

  it("returns a 401 error if an invalid token is provided", async () => {
    await request(app)
      .get("/users/me")
      .auth("invalid-token", { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("PUT /users/me", () => {
  it("returns the authenticated user on success", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send(userUpdatePayload)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: userUpdatePayload.name,
      username: userUpdatePayload.username,
      createdAt: expect.any(String),
      description: userUpdatePayload.description,
      location: userUpdatePayload.location,
      profileImageUrl: null,
      url: userUpdatePayload.url,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns the authenticated user when username is unmodified", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, username: userCreationPayload.username })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: userUpdatePayload.name,
      username: userCreationPayload.username,
      createdAt: expect.any(String),
      description: userUpdatePayload.description,
      location: userUpdatePayload.location,
      profileImageUrl: null,
      url: userUpdatePayload.url,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns the authenticated user when optional fields are empty strings", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, description: "", location: "", url: "" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: userUpdatePayload.name,
      username: userUpdatePayload.username,
      createdAt: expect.any(String),
      description: null,
      location: null,
      profileImageUrl: null,
      url: null,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns a 422 error when name exceeds 50 characters", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({
        ...userUpdatePayload,
        name: "Has Erling Braut Haaland Broken Another Goalscoring Record?",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
      ]),
    });
  });

  it("returns a 422 error when username is less than 5 characters", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, username: "john" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username exceeds 15 characters", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, username: "jonathan_mcdonald" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username contains spaces", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, username: "john doe" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when username contains invalid special characters", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, username: "john.doe" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "username" }),
      ]),
    });
  });

  it("returns a 422 error when description exceeds 160 characters", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({
        ...userUpdatePayload,
        description:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus.",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "description" }),
      ]),
    });
  });

  it("returns a 422 error when location exceeds 30 characters", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({
        ...userUpdatePayload,
        location: "A really long location is invalid",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "location" }),
      ]),
    });
  });

  it("returns a 422 error when URL is invalid", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .put("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ ...userUpdatePayload, url: "Invalid URL" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "url" }),
      ]),
    });
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .put("/users/me")
      .send(userUpdatePayload)
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /users/:userId", () => {
  it("returns a user on success", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .get(`/users/${userRes.body.user.id}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "John Doe",
      username: "john_doe_123",
      createdAt: expect.any(String),
      description: null,
      location: null,
      profileImageUrl: null,
      url: null,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns a 404 error if the user ID doesn't exist", async () => {
    await request(app)
      .get("/users/1")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });

  it("returns a 422 error if the user ID is not an integer", async () => {
    const res = await request(app)
      .get("/users/1.5")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });
});

describe("GET /users/by/username/:username", () => {
  it("returns a user on success", async () => {
    await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .get("/users/by/username/john_doe_123")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: userCreationPayload.name,
      username: userCreationPayload.username,
      createdAt: expect.any(String),
      description: null,
      location: null,
      profileImageUrl: null,
      url: null,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns the same user when username is provided in different case", async () => {
    await request(app).post("/users").send(userCreationPayload);

    const res = await request(app)
      .get("/users/by/username/JOHN_DOE_123")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: userCreationPayload.name,
      username: userCreationPayload.username,
      createdAt: expect.any(String),
      description: null,
      location: null,
      profileImageUrl: null,
      url: null,
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("returns a 404 error if a user with the username doesn't exist", async () => {
    await request(app)
      .get("/users/by/username/john_doe_123")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });
});

describe("GET /users/me/posts", () => {
  it("returns the authenticated user's posts on success", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const { user, token } = userRes.body;

    const otherUserRes = await request(app)
      .post("/users")
      .send({ ...userCreationPayload, name: "Jane Doe", username: "jane_doe" });

    await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .post("/posts")
      .auth(otherUserRes.body.token, { type: "bearer" })
      .send({ text: "This is a post from another user." });

    const res = await request(app)
      .get("/users/me/posts")
      .auth(userRes.body.token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        text: "This is my first post.",
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
          bookmarks: 0,
        },
      },
    ]);
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .get("/users/me/posts")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /users/:userId/posts", () => {
  it("returns a user's posts on success", async () => {
    const userRes = await request(app).post("/users").send(userCreationPayload);

    const otherUserRes = await request(app)
      .post("/users")
      .send({ ...userCreationPayload, name: "Jane Doe", username: "jane_doe" });

    const { user, token } = otherUserRes.body;

    await request(app)
      .post("/posts")
      .auth(userRes.body.token, { type: "bearer" })
      .send({ text: "This is my first post." });

    await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is a post from another user." });

    const res = await request(app)
      .get(`/users/${user.id}/posts`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual([
      {
        id: expect.any(Number),
        text: "This is a post from another user.",
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
          bookmarks: 0,
        },
      },
    ]);
  });

  it("returns a 404 error if the user doesn't exist", async () => {
    await request(app)
      .get("/users/1/posts")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });

  it("returns a 422 error if the user ID isn't an integer", async () => {
    const res = await request(app)
      .get("/users/1.5/posts")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });
});

describe("GET /users/:userId/likes", () => {
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
      .get(`/users/${user.id}/likes`)
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
        pinnedById: null,
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
      },
    ]);
  });

  it("returns a 404 error if the user doesn't exist", async () => {
    await request(app)
      .get("/users/1/likes")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });

  it("returns a 422 error if the user ID isn't an integer", async () => {
    const res = await request(app)
      .get("/users/1.5/likes")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });
});

describe("GET /users/:userId/following", () => {
  it("returns a list of users that a specific user follows on success", async () => {
    const { token, user } = await createUser();
    const { user: firstUser } = await createUser({ username: "jane_doe" });
    const { user: secondUser } = await createUser({ username: "jake_ryan" });

    await request(app)
      .put(`/users/me/following/${firstUser.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .put(`/users/me/following/${secondUser.id}`)
      .auth(token, { type: "bearer" });

    const res = await request(app)
      .get(`/users/${user.id}/following`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        { ...firstUser, _count: { ...firstUser._count, followers: 1 } },
        { ...secondUser, _count: { ...secondUser._count, followers: 1 } },
      ]),
    );
  });

  it("returns a 422 error if the user ID isn't an integer", async () => {
    const res = await request(app)
      .get("/users/1.5/following")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });

  it("returns a 404 error if the user doesn't exist", async () => {
    await request(app)
      .get("/users/1/following")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });
});

describe("GET /users/me/followers", () => {
  it("returns a list of users who follow the authenticated user", async () => {
    const { token, user } = await createUser();
    const { user: firstUser, token: firstUserToken } = await createUser({
      username: "jane_doe",
    });
    const { user: secondUser, token: secondUserToken } = await createUser({
      username: "jake_ryan",
    });

    await request(app)
      .put(`/users/me/following/${user.id}`)
      .auth(firstUserToken, { type: "bearer" });

    await request(app)
      .put(`/users/me/following/${user.id}`)
      .auth(secondUserToken, { type: "bearer" });

    const res = await request(app)
      .get(`/users/me/followers`)
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        { ...firstUser, _count: { ...firstUser._count, following: 1 } },
        { ...secondUser, _count: { ...secondUser._count, following: 1 } },
      ]),
    );
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .get("/users/me/followers")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /users/:userId/followers", () => {
  it("returns a list of users who follow the authenticated user", async () => {
    const { user } = await createUser();
    const { user: firstUser, token: firstUserToken } = await createUser({
      username: "jane_doe",
    });
    const { user: secondUser, token: secondUserToken } = await createUser({
      username: "jake_ryan",
    });

    await request(app)
      .put(`/users/me/following/${user.id}`)
      .auth(firstUserToken, { type: "bearer" });

    await request(app)
      .put(`/users/me/following/${user.id}`)
      .auth(secondUserToken, { type: "bearer" });

    const res = await request(app)
      .get(`/users/${user.id}/followers`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        { ...firstUser, _count: { ...firstUser._count, following: 1 } },
        { ...secondUser, _count: { ...secondUser._count, following: 1 } },
      ]),
    );
  });

  it("returns a 422 error if the user ID isn't an integer", async () => {
    const res = await request(app)
      .get("/users/1.5/followers")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "userId" }),
      ]),
    });
  });

  it("returns a 404 error if the user doesn't exist", async () => {
    await request(app)
      .get("/users/1/followers")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });
});
