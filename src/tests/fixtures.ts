import request from "supertest";
import app from "./app.ts";

interface UserWithToken {
  user: {
    username: string;
    name: string;
    id: number;
    createdAt: Date;
    profileImageUrl: string | null;
    description: string | null;
    location: string | null;
    url: string | null;
    _count: {
      followers: number;
      following: number;
    };
    connectionStatus: {
      isFollower: boolean;
      isFollowing: boolean;
    };
  };
  token: string;
}

export const userCreationPayload = {
  name: "John Doe",
  username: "john_doe_123",
  password: "Password123!",
  passwordConfirmation: "Password123!",
};

export const userUpdatePayload = {
  name: "Jonathan Doe",
  username: "jonathan_doe",
  description: "I'm just a silly guy that likes computer science.",
  location: "Somewhere",
  url: "https://jonathandoe.com",
};

export const createUser = async ({
  username = "john_doe_123",
} = {}): Promise<UserWithToken> => {
  const res = await request(app).post("/users").send({
    name: "John Doe",
    username,
    password: "Password123!",
    passwordConfirmation: "Password123!",
  });

  return res.body;
};
