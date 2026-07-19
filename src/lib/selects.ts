import type {
  PostInclude,
  PostOmit,
  UserInclude,
  UserOmit,
} from "../generated/prisma/models.ts";

interface UserShape {
  id: number;
  name: string;
  username: string;
  createdAt: Date;
  description: string | null;
  location: string | null;
  profileImageUrl: string | null;
  url: string | null;
  pinnedPostId: number | null;
  _count: {
    followers: number;
    following: number;
  };
  followers?: {
    followerId: number;
    followingId: number;
    followedAt: Date;
  }[];
  following?: {
    followerId: number;
    followingId: number;
    followedAt: Date;
  }[];
}

export const selectUserFields = (userId?: number) =>
  ({
    omit: {
      password: true,
      githubId: true,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      ...(userId && {
        followers: {
          where: {
            followerId: userId,
          },
        },
      }),
      ...(userId && {
        following: {
          where: {
            followingId: userId,
          },
        },
      }),
    },
  }) satisfies { omit: UserOmit; include: UserInclude };

export const postFields = {
  omit: {
    authorId: true,
    inReplyToPostId: true,
    quotedPostId: true,
  },
  include: {
    author: {
      select: {
        id: true,
        name: true,
        username: true,
        profileImageUrl: true,
      },
    },
    repliedTo: {
      select: {
        id: true,
        text: true,
        attachment: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    },
    quotedPost: {
      select: {
        id: true,
        text: true,
        attachment: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImageUrl: true,
          },
        },
      },
    },
    _count: {
      select: {
        reposts: true,
        replies: true,
        likes: true,
        quotes: true,
        bookmarks: true,
      },
    },
  },
} satisfies {
  omit: PostOmit;
  include: PostInclude;
};

export const transformUser = ({
  followers,
  following,
  ...rest
}: UserShape) => ({
  ...rest,
  connectionStatus: {
    isFollower: following ? following.length > 0 : false,
    isFollowing: followers ? followers.length > 0 : false,
  },
});
