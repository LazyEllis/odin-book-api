import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";

const setup = async () => {
  const res = await request(app).post("/users").send({
    name: "John Doe",
    username: "john_doe_123",
    password: "Password123!",
    passwordConfirmation: "Password123!",
  });

  return res.body;
};

describe("POST /posts", () => {
  it("returns the created post on success", async () => {
    const { user, token } = await setup();

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
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
    });
  });

  it("returns the created reply on success", async () => {
    const { user, token } = await setup();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({
        text: "This post is a reply to my first post.",
        inReplyToPostId: postRes.body.id,
      })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(Number),
      text: "This post is a reply to my first post.",
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
      repliedTo: {
        id: postRes.body.id,
        text: "This is my first post.",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
      },
      quotedPost: null,
      _count: {
        reposts: 0,
        replies: 0,
        likes: 0,
        quotes: 0,
        bookmarks: 0,
      },
    });
  });

  it("returns the created quote on success", async () => {
    const { user, token } = await setup();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({
        text: "This post quotes my first post.",
        quotedPostId: postRes.body.id,
      })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(Number),
      text: "This post quotes my first post.",
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
      quotedPost: {
        id: postRes.body.id,
        text: "This is my first post.",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
      },
      _count: {
        reposts: 0,
        replies: 0,
        likes: 0,
        quotes: 0,
        bookmarks: 0,
      },
    });
  });

  it("returns the created reply that quotes a post on success", async () => {
    const { user, token } = await setup();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    const quotedPostRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is another post." });

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({
        text: "This post is both a quote and a reply.",
        inReplyToPostId: postRes.body.id,
        quotedPostId: quotedPostRes.body.id,
      });

    expect(res.body).toEqual({
      id: expect.any(Number),
      text: "This post is both a quote and a reply.",
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
      repliedTo: {
        id: postRes.body.id,
        text: "This is my first post.",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
      },
      quotedPost: {
        id: quotedPostRes.body.id,
        text: "This is another post.",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
      },
      _count: {
        reposts: 0,
        replies: 0,
        likes: 0,
        quotes: 0,
        bookmarks: 0,
      },
    });
  });

  it("returns a 422 error if the text is empty", async () => {
    const { token } = await setup();

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "text" }),
      ]),
    });
  });

  it("returns a 422 error if the replied-to post does not exist", async () => {
    const { token } = await setup();

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post quotes another post", inReplyToPostId: 1 })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "inReplyToPostId" }),
      ]),
    });
  });

  it("returns a 422 error if the quoted post does not exist", async () => {
    const { token } = await setup();

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post quotes another post", quotedPostId: 1 })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "quotedPostId" }),
      ]),
    });
  });

  it("returns a 422 error if a post quotes and replies to the same post", async () => {
    const { token } = await setup();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({
        text: "This post is both a quote and a reply.",
        inReplyToPostId: postRes.body.id,
        quotedPostId: postRes.body.id,
      });

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "quotedPostId" }),
      ]),
    });
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .post("/posts")
      .send({ text: "This is my first post." })
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /posts", () => {
  it("returns all created posts", async () => {
    const { user, token } = await setup();

    await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post" });

    await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is another post" });

    const res = await request(app)
      .get("/posts")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual(
      expect.arrayContaining([
        {
          id: expect.any(Number),
          text: "This is my first post",
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
        {
          id: expect.any(Number),
          text: "This is another post",
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
      ]),
    );
  });
});

describe("GET /posts/:postId", () => {
  it("returns a post on success", async () => {
    const { user, token } = await setup();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post" });

    const res = await request(app)
      .get(`/posts/${postRes.body.id}`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual({
      id: expect.any(Number),
      text: "This is my first post",
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
    });
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    await request(app)
      .get("/posts/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const res = await request(app)
      .get("/posts/1.5")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });
});
