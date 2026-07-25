import type {
  UserInclude,
  UserOmit,
  UserGetPayload,
} from "../generated/prisma/models.ts";

type UserPayload = UserGetPayload<ReturnType<typeof buildUserSelect>>;

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

export const mapToUserResponse = ({
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
