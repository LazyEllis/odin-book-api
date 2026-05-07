import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";

const validPayload = {
  name: "John Doe",
  username: "john_doe_123",
  password: "Password123!",
  passwordConfirmation: "Password123!",
};

describe("POST /users", () => {
  it("returns the created user with a token on success", async () => {
    const res = await request(app)
      .post("/users")
      .send(validPayload)
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
      user: {
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
        ...validPayload,
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
      .send({ ...validPayload, username: "john" })
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
      .send({ ...validPayload, username: "jonathan_mcdonald" })
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
      .send({ ...validPayload, username: "john doe" })
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
      .send({ ...validPayload, username: "john.doe" })
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
      .send(validPayload)
      .expect("Content-Type", /json/)
      .expect(201);

    const res = await request(app)
      .post("/users")
      .send({ ...validPayload, name: "Jonathan Doe", username: "JOHN_DOE_123" })
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
        ...validPayload,
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
        ...validPayload,
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
  it("returns all created users sorted alphabetically", async () => {
    await request(app).post("/users").send(validPayload);

    await request(app)
      .post("/users")
      .send({ ...validPayload, name: "Jane Doe", username: "jane_doe" });

    const res = await request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual([
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
      {
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
      },
    ]);
  });
});

describe("GET /users/me", () => {
  it("returns the authenticated user on success", async () => {
    const userRes = await request(app).post("/users").send(validPayload);

    const res = await request(app)
      .get("/users/me")
      .auth(userRes.body.token, { type: "bearer" })
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

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .get("/users/me")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);

    await request(app)
      .get("/users/me")
      .auth("invalid-token", { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /users/:userId", () => {
  it("returns a user on success", async () => {
    const userRes = await request(app).post("/users").send(validPayload);

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
    await request(app).post("/users").send(validPayload);

    const res = await request(app)
      .get("/users/by/username/john_doe_123")
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

  it("returns the same user when username is provided in different case", async () => {
    await request(app).post("/users").send(validPayload);

    const res = await request(app)
      .get("/users/by/username/JOHN_DOE_123")
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

  it("returns a 404 error if a user with the username doesn't exist", async () => {
    await request(app)
      .get("/users/by/username/john_doe_123")
      .expect("Content-Type", /json/)
      .expect({ message: "User not found" })
      .expect(404);
  });
});
