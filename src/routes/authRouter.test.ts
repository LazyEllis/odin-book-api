import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { redis } from "../lib/redis.ts";

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

describe("GET /auth/github", () => {
  it("redirects to GitHub's OAuth authorize URL", async () => {
    const res = await request(app).get("/auth/github");

    const location = new URL(res.headers.location);

    expect(location.origin).toBe("https://github.com");
    expect(location.pathname).toBe("/login/oauth/authorize");
    expect(location.searchParams.get("client_id")).toBe(
      process.env.GITHUB_CLIENT_ID,
    );
    expect(location.searchParams.get("scope")).toBe("user:email");
  });
});

describe("POST /auth/exchange", () => {
  it("returns a JWT for a valid code", async () => {
    const code = "test-code-123";
    await redis.set(`oauth:${code}`, JSON.stringify({ id: 1 }), {
      expiration: { type: "EX", value: 60 },
    });

    const res = await request(app)
      .post("/auth/exchange")
      .send({ code })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({ token: expect.any(String) });
  });

  it("deletes the code after single use", async () => {
    const code = "test-code-123";
    await redis.set(`oauth:${code}`, JSON.stringify({ id: 1 }), {
      expiration: { type: "EX", value: 60 },
    });

    await request(app).post("/auth/exchange").send({ code });

    await request(app)
      .post("/auth/exchange")
      .send({ code })
      .expect("Content-Type", /json/)
      .expect(401)
      .expect({ message: "The verification code is invalid or has expired" });
  });

  it("returns 401 for an invalid code", async () => {
    await request(app)
      .post("/auth/exchange")
      .send({ code: "Invalid code" })
      .expect("Content-Type", /json/)
      .expect(401)
      .expect({ message: "The verification code is invalid or has expired" });
  });
});
