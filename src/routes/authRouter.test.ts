import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";

describe("POST /auth/token", () => {
  it("returns a JWT on success", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe_123",
      password: "Password123!",
      passwordConfirmation: "Password123!",
    });

    const res = await request(app)
      .post("/auth/token")
      .send({
        username: "john_doe_123",
        password: "Password123!",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({ token: expect.any(String) });
  });

  it("returns a 401 error if the user does not exist", async () => {
    await request(app)
      .post("/auth/token")
      .send({
        username: "john_doe_123",
        password: "Password123!",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Invalid username or password" })
      .expect(401);
  });

  it("returns a 401 error if the password is incorrect", async () => {
    await request(app).post("/users").send({
      name: "John Doe",
      username: "john_doe_123",
      password: "Password123!",
      passwordConfirmation: "Password123!",
    });

    await request(app)
      .post("/auth/token")
      .send({
        username: "john_doe_123",
        password: "Password123$",
      })
      .expect("Content-Type", /json/)
      .expect({ message: "Invalid username or password" })
      .expect(401);
  });
});
