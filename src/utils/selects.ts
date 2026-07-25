import type { Prisma } from "../generated/prisma/client.ts";
import type {
  PostInclude,
  PostOmit,
  UserInclude,
  UserOmit,
} from "../generated/prisma/models.ts";

type UserPayload = Prisma.UserGetPayload<ReturnType<typeof selectUserFields>>;

type PostPayload = Prisma.PostGetPayload<ReturnType<typeof selectPostFields>>;

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
          where: { followerId: userId },
        },
        following: {
          where: { followingId: userId },
        },
      }),
    },
  }) satisfies { omit: UserOmit; include: UserInclude };

export const selectPostFields = (userId?: number) =>
  ({
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
      ...(userId && {
        likes: {
          where: { userId },
        },
        reposts: {
          where: { userId },
        },
        bookmarks: {
          where: { userId },
        },
      }),
    },
  }) satisfies {
    omit: PostOmit;
    include: PostInclude;
  };

export const transformUser = ({
  followers,
  following,
  ...rest
}: UserPayload) => ({
  ...rest,
  connectionStatus: {
    isFollower: !!following && following.length > 0,
    isFollowing: !!followers && followers.length > 0,
  },
});

export const transformPost = ({
  likes,
  reposts,
  bookmarks,
  ...rest
}: PostPayload) => ({
  ...rest,
  interactionStatus: {
    isLiked: !!likes && likes.length > 0,
    isReposted: !!reposts && reposts.length > 0,
    isBookmarked: !!bookmarks && bookmarks.length > 0,
  },
});
