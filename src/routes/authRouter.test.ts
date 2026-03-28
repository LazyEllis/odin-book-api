import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";

describe("POST /auth/token", () => {
  it("returns a JWT on successful sign in", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    const res = await request(app)
      .post("/auth/token")
      .send({ username: "john_doe", password: "Password123$" })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({ token: expect.any(String) });
  });

  it("throws a 401 error if user doesn't exist", async () => {
    await request(app)
      .post("/auth/token")
      .send({ username: "john_doe", password: "Password123$" })
      .expect("Content-Type", /json/)
      .expect({ message: "Invalid username or password" })
      .expect(401);
  });

  it("throws a 401 error if the wrong password is entered", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe",
      password: "Password123$",
      passwordConfirmation: "Password123$",
    });

    await request(app)
      .post("/auth/token")
      .send({ username: "john_doe", password: "password" })
      .expect("Content-Type", /json/)
      .expect({ message: "Invalid username or password" })
      .expect(401);
  });
});
