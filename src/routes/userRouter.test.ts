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

    expect(res.body).toMatchObject({
      user: {
        id: expect.any(Number),
        name: "John Doe",
        username: "john_doe",
        createdAt: expect.any(String),
      },
      token: expect.any(String),
    });

    expect(Date.parse(res.body.user.createdAt)).not.toBe(NaN);
    expect(res.body.user).not.toHaveProperty("password");
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
