import type {
  PostInclude,
  PostOmit,
  PostGetPayload,
} from "../generated/prisma/models.ts";

type PostPayload = PostGetPayload<ReturnType<typeof buildPostSelect>>;

export const buildPostSelect = (
  userId?: number,
): { omit: PostOmit; include: PostInclude } => ({
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
});

export const mapToPostResponse = ({
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
