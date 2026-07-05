export const userFields = {
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
  },
};

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
};
