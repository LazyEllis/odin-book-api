import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../tests/app.ts";
import { createUser } from "../tests/fixtures.ts";

describe("POST /posts", () => {
  it("returns the created post on success", async () => {
    const { user, token } = await createUser();

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
    const { user, token } = await createUser();

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
      conversationId: postRes.body.id,
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
    const { user, token } = await createUser();

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
    const { user, token } = await createUser();

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
      conversationId: postRes.body.id,
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

  it("maintains the root conversation ID on nested replies", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post." });

    const replyRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({
        text: "This post is a reply to my first post.",
        inReplyToPostId: postRes.body.id,
      });

    const res = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({
        text: "This is a nested reply.",
        inReplyToPostId: replyRes.body.id,
      })
      .expect("Content-Type", /json/)
      .expect(201);

    expect(res.body).toEqual({
      id: expect.any(Number),
      text: "This is a nested reply.",
      attachment: null,
      createdAt: expect.any(String),
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
      },
      pinnedById: null,
      conversationId: postRes.body.id,
      repliedTo: {
        id: replyRes.body.id,
        text: "This post is a reply to my first post.",
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

  it("returns a 422 error if the text is empty", async () => {
    const { token } = await createUser();

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
    const { token } = await createUser();

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
    const { token } = await createUser();

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
    const { token } = await createUser();

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
    const { user, token } = await createUser();

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
    const { user, token } = await createUser();

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

describe("DELETE /posts/:postId", () => {
  it("deletes a post on success", async () => {
    const { token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post" });

    await request(app)
      .delete(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect(204);

    await request(app).get("/posts").expect([]);
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    const { token } = await createUser();

    await request(app)
      .delete("/posts/1")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 403 error if the authenticated user is not the post's author", async () => {
    const { token: authorToken } = await createUser();
    const { token } = await createUser({ username: "jane_doe_123" });

    const postRes = await request(app)
      .post("/posts")
      .auth(authorToken, { type: "bearer" })
      .send({ text: "This is my first post" });

    await request(app)
      .delete(`/posts/${postRes.body.id}`)
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect({ message: "You don't have permission to delete this post" })
      .expect(403);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .delete("/posts/1.5")
      .auth(token, { type: "bearer" })
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });

  it("returns a 401 error if unauthenticated", async () => {
    await request(app)
      .delete("/posts/1")
      .expect("Content-Type", /json/)
      .expect({ message: "Unauthorized" })
      .expect(401);
  });
});

describe("GET /posts/:postId/replies", () => {
  it("returns all replies of a post", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post" });

    await request(app).post("/posts").auth(token, { type: "bearer" }).send({
      text: "This is a reply to my first post",
      inReplyToPostId: postRes.body.id,
    });

    await request(app).post("/posts").auth(token, { type: "bearer" }).send({
      text: "This quotes my first post",
      quotedPostId: postRes.body.id,
    });

    const repliesRes = await request(app)
      .get(`/posts/${postRes.body.id}/replies`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(repliesRes.body).toEqual([
      {
        id: expect.any(Number),
        text: "This is a reply to my first post",
        attachment: null,
        createdAt: expect.any(String),
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
        },
        pinnedById: null,
        conversationId: postRes.body.id,
        repliedTo: {
          id: postRes.body.id,
          text: "This is my first post",
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
      },
    ]);
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    await request(app)
      .get("/posts/1/replies")
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const res = await request(app)
      .get("/posts/1.5/replies")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });
});

describe("GET /posts/:postId/quotes", () => {
  it("returns all quotes of a post", async () => {
    const { user, token } = await createUser();

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This is my first post" });

    await request(app).post("/posts").auth(token, { type: "bearer" }).send({
      text: "This is a reply to my first post",
      inReplyToPostId: postRes.body.id,
    });

    await request(app).post("/posts").auth(token, { type: "bearer" }).send({
      text: "This quotes my first post",
      quotedPostId: postRes.body.id,
    });

    const quotesRes = await request(app)
      .get(`/posts/${postRes.body.id}/quotes`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(quotesRes.body).toEqual([
      {
        id: expect.any(Number),
        text: "This quotes my first post",
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
          text: "This is my first post",
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
      },
    ]);
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    await request(app)
      .get("/posts/1/quotes")
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const res = await request(app)
      .get("/posts/1.5/quotes")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });
});

describe("GET /posts/:postId/reposted_by", () => {
  it("returns a list of users that have reposted a post on success", async () => {
    const { token, user } = await createUser();
    const { token: reposterToken, user: reposter } = await createUser({
      username: "jane_doe",
    });

    const postRes = await request(app)
      .post("/posts")
      .auth(token, { type: "bearer" })
      .send({ text: "This post has been reposted" });

    await request(app)
      .put(`/users/me/reposts/${postRes.body.id}`)
      .auth(token, { type: "bearer" });

    await request(app)
      .put(`/users/me/reposts/${postRes.body.id}`)
      .auth(reposterToken, { type: "bearer" });

    const res = await request(app)
      .get(`/posts/${postRes.body.id}/reposted_by`)
      .expect("Content-Type", /json/)
      .expect(200);

    expect(res.body).toEqual(expect.arrayContaining([user, reposter]));
  });

  it("returns a 404 error if the post doesn't exist", async () => {
    await request(app)
      .get("/posts/1/reposted_by")
      .expect("Content-Type", /json/)
      .expect({ message: "Post not found" })
      .expect(404);
  });

  it("returns a 422 error if the post ID is not an integer", async () => {
    const res = await request(app)
      .get("/posts/1.5/reposted_by")
      .expect("Content-Type", /json/)
      .expect(422);

    expect(res.body).toEqual({
      errors: expect.arrayContaining([
        expect.objectContaining({ path: "postId" }),
      ]),
    });
  });
});
