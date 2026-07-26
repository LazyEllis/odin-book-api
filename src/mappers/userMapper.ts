import type { UserInclude, UserOmit } from "../generated/prisma/models.ts";

interface UserOptional {
  followers?: unknown[];
  following?: unknown[];
}

export const buildUserSelect = (
  userId?: number,
): { omit: UserOmit; include: UserInclude } => ({
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
});

export const mapToUserResponse = <T extends UserOptional>({
  followers,
  following,
  ...rest
}: T) => ({
  ...rest,
  connectionStatus: {
    isFollower: !!following && following.length > 0,
    isFollowing: !!followers && followers.length > 0,
  },
});
