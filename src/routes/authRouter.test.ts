import type { Request } from "express";
import { type AuthenticateOptions, Strategy } from "passport";
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";

interface VerifyCallback {
  (
    accessToken: string,
    refreshToken: string,
    profile: typeof mockUser,
    done: (a: unknown, user: typeof mockUser) => void,
  ): void;
}

const mockUser = vi.hoisted(() => ({
  id: "1234",
  displayName: "John Doe",
  username: "john_doe",
  photos: [{ value: "some_photo.jpg" }],
  profileUrl: "https://github.com/john_doe",
}));

vi.mock("passport-github2", () => ({
  Strategy: class extends Strategy {
    cb: VerifyCallback;

    constructor(_name: string, cb: VerifyCallback) {
      super();
      this.name = "github";
      this.cb = cb;
    }

    authenticate(req: Request, options: AuthenticateOptions) {
      if (!req.query?.code) {
        const params = new URLSearchParams({
          client_id: String(process.env.GITHUB_CLIENT_ID),
          scope: String(options.scope),
        });

        return this.redirect(
          `https://github.com/login/oauth/authorize?${params.toString()}`,
        );
      }

      this.cb("N/A", "N/A", mockUser, (_err, user) => {
        this.success({ ...user, id: Number(user.id) });
      });
    }
  },
}));

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

describe("GET /auth/github/callback", () => {
  it("redirects to frontend with a code param", async () => {
    const res = await request(app).get("/auth/github/callback?code=test_code");
    const location = new URL(res.headers.location);

    expect(location.origin).toBe(process.env.FRONTEND_URL);
    expect(location.pathname).toBe("/oauth/callback");
    expect(location.searchParams.get("code")).toEqual(expect.any(String));
  });

  it("creates a user on success", async () => {
    await request(app).get("/auth/github/callback?code=test_code");

    const res = await request(app).get(
      `/users/by/username/${mockUser.username}`,
    );

    expect(res.body).toEqual({
      id: expect.any(Number),
      name: mockUser.displayName,
      username: mockUser.username,
      createdAt: expect.any(String),
      description: null,
      location: null,
      profileImageUrl: mockUser.photos[0].value,
      url: mockUser.profileUrl,
      pinnedPostId: null,
      _count: {
        followers: 0,
        following: 0,
      },
      connectionStatus: {
        isFollower: false,
        isFollowing: false,
      },
    });
  });
});

describe("POST /auth/exchange", () => {
  it("returns a JWT for a valid code", async () => {
    const callbackRes = await request(app).get(
      "/auth/github/callback?code=test_code",
    );
    const code = new URL(callbackRes.headers.location).searchParams.get("code");

    const res = await request(app)
      .post("/auth/exchange")
      .send({ code })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({ token: expect.any(String) });
  });

  it("deletes the code after single use", async () => {
    const callbackRes = await request(app).get(
      "/auth/github/callback?code=test_code",
    );
    const code = new URL(callbackRes.headers.location).searchParams.get("code");

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
