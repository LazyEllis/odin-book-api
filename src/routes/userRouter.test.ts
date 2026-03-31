import { describe, it, expect } from "vitest";
import type { ValidationError } from "express-validator";
import request from "supertest";
import app from "../tests/app.ts";

describe("POST /users", () => {
  it("returns the created user on success", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        name: "John Doe",
        username: "john_doe",
        password: "Password123$",
        passwordConfirmation: "Password123$",
      })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
      user: {
        id: expect.any(Number),
        name: "John Doe",
        username: "john_doe",
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
    expect(Date.parse(res.body.user.createdAt)).not.toBe(NaN);
  });

  it("throws a 422 error if required fields are missing", async () => {
    await request(app)
      .post("/users")
      .send({
        username: "John_Doe",
        password: "Password123$",
        passwordConfirmation: "Password123$",
      })
      .expect("Content-Type", /json/)
      .expect(422);
  });

  it("throws a 422 error if the username already exists", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .post("/users")
      .send({
        name: "John Doe",
        username: "John_Doe",
        password: "Password123$",
        passwordConfirmation: "Password123$",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(
      res.body.errors.some((error: ValidationError) =>
        /username/.test(error.msg),
      ),
    ).toBe(true);
  });

  it("throws a 422 error if the username is invalid", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        name: "John Doe",
        username: "john doe",
        password: "Password123$",
        passwordConfirmation: "Password123$",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(
      res.body.errors.some((error: ValidationError) =>
        /username/.test(error.msg),
      ),
    ).toBe(true);
  });

  it("throws a 422 error if the password is weak", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        name: "Jane Doe",
        username: "jane_doe",
        password: "password",
        passwordConfirmation: "password",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(
      res.body.errors.some((error: ValidationError) =>
        /password/.test(error.msg),
      ),
    ).toBe(true);
  });

  it("throws a 422 error if the passwords don't match", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        name: "Jane Doe",
        username: "jane_doe",
        password: "Password123$",
        passwordConfirmation: "Password132$",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(
      res.body.errors.some((error: ValidationError) =>
        /password/.test(error.msg),
      ),
    ).toBe(true);
  });
});

describe("GET /users", () => {
  it("returns all created users", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    await request(app).post("/users").send({
      name: "Jane Doe",
      username: "jane_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body.length).toBe(2);
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
        username: "john_doe",
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

  it("returns an empty array if there are no users", async () => {
    await request(app)
      .get("/users")
      .expect("Content-Type", /json/)
      .expect([])
      .expect(200);
  });
});

describe("GET /users/me", () => {
  it("returns the authenticated user profile", async () => {
    const authRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .get("/users/me")
      .auth(authRes.body.token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "John Doe",
      username: "john_doe",
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

  it("throws a 401 error if not authenticated", async () => {
    await request(app)
      .get("/users/me")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("PUT /users/me", () => {
  it("returns the updated user on success", async () => {
    const authRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .put("/users/me")
      .auth(authRes.body.token, { type: "bearer" })
      .send({
        name: "Dr. John Doe",
        username: "doc_john_doe",
        description: "I just got my PhD. Big ups to me.",
        location: "Somewhere Not Here",
        url: "https://www.johndoe.com",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "Dr. John Doe",
      username: "doc_john_doe",
      createdAt: expect.any(String),
      description: "I just got my PhD. Big ups to me.",
      location: "Somewhere Not Here",
      profileImageUrl: null,
      url: "https://www.johndoe.com",
      _count: {
        followers: 0,
        following: 0,
      },
    });
  });

  it("does not mandate optional fields", async () => {
    const authRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .put("/users/me")
      .auth(authRes.body.token, { type: "bearer" })
      .send({
        name: "Dr. John Doe",
        username: "john_doe",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "Dr. John Doe",
      username: "john_doe",
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

  it("sets the value of empty fields to null", async () => {
    const authRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .put("/users/me")
      .auth(authRes.body.token, { type: "bearer" })
      .send({
        name: "Dr. John Doe",
        username: "john_doe",
        description: "",
        location: "",
        url: "",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "Dr. John Doe",
      username: "john_doe",
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

  it("throws a 422 error if the url is invalid", async () => {
    const authRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .put("/users/me")
      .auth(authRes.body.token, { type: "bearer" })
      .send({
        name: "Dr. John Doe",
        username: "john_doe",
        url: "john_doe",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(
      res.body.errors.some((error: ValidationError) => /url/i.test(error.msg)),
    ).toBe(true);
  });

  it("throws a 422 error if the username is already in use", async () => {
    await request(app).post("/users").send({
      name: "Jane Doe",
      username: "jane_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const authRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .put("/users/me")
      .auth(authRes.body.token, { type: "bearer" })
      .send({
        name: "Dr. John Doe",
        username: "jane_doe",
      })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(
      res.body.errors.some((error: ValidationError) =>
        /username/.test(error.msg),
      ),
    ).toBe(true);
  });

  it("throws a 401 error if not authenticated", async () => {
    await request(app)
      .put("/users/me")
      .send({
        name: "Dr. John Doe",
        username: "john_doe",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /users/:userId", () => {
  it("returns the discovered user's profile", async () => {
    const userRes = await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .get(`/users/${userRes.body.user.id}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "John Doe",
      username: "john_doe",
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

  it("throws a 404 error id the user does not exist", async () => {
    await request(app)
      .get(`/users/1`)
      .expect("Content-Type", /json/)
      .expect({ message: "User Not Found" })
      .expect(404);
  });
});

describe("GET /users/by/username/:username", () => {
  it("returns the discovered user's profile", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .get(`/users/by/username/john_doe`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: "John Doe",
      username: "john_doe",
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

  it("throws a 404 error id the user does not exist", async () => {
    await request(app)
      .get(`/users/by/username/john_doe`)
      .expect("Content-Type", /json/)
      .expect({ message: "User Not Found" })
      .expect(404);
  });
});
