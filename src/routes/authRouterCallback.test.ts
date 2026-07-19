import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import passport from "passport";
import app from "../tests/app.ts";

interface GitHubProfile {
  id: string;
  displayName: string;
  username: string;
  photos: {
    value: string;
  }[];
  profileUrl: string;
}

const mockUser = vi.hoisted(() => ({
  id: "1234",
  displayName: "John Doe",
  username: "john_doe",
  photos: [{ value: "some_photo.jpg" }],
  profileUrl: "https://github.com/john_doe",
}));

vi.mock("passport-github2", () => ({
  Strategy: class extends passport.Strategy {
    name: string;
    _user: GitHubProfile;
    _cb: (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: (a: unknown, user: GitHubProfile) => void,
    ) => void;

    constructor(_name: string, cb: never) {
      super();

      this.name = "github";
      this._cb = cb;
      this._user = mockUser;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    authenticate(_req: unknown, _options: unknown) {
      this._cb(
        "N/A",
        "N/A",
        this._user,
        (err: unknown, user: GitHubProfile) => {
          this.success({ ...user, id: Number(user.id) });
        },
      );
    }
  },
}));

describe("GET /auth/github/callback", () => {
  it("redirects to frontend with a code param", async () => {
    const res = await request(app).get("/auth/github/callback");
    const location = new URL(res.headers.location);

    expect(location.origin).toBe(process.env.FRONTEND_URL);
    expect(location.pathname).toBe("/oauth/callback");
    expect(location.searchParams.get("code")).toEqual(expect.any(String));
  });

  it("creates a user on success", async () => {
    await request(app).get("/auth/github/callback");

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
