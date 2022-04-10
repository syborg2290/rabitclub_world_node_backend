export const UserObj = (userRes, isWithoutPassword) => {
  return {
    _id: userRes._id,
    email: userRes.email,
    username: userRes.username,
    password: isWithoutPassword ? null : userRes.password,
    profile_pic_small: userRes.profile_pic_small,
    profile_pic_medium: userRes.profile_pic_medium,
    profile_pic_default: userRes.profile_pic_default,
    cover_pic: userRes.cover_pic,
    salt: isWithoutPassword ? null : userRes.salt,
    key: userRes.key,
    isVerified: userRes.isVerified,
    followers: userRes.followers.length,
    following: userRes.following.length,
    status: userRes.status,
    createdAt: userRes.createdAt,
    updatedAt: userRes.updatedAt,
    bio: userRes.bio,
    isAlreadyLogged: userRes.isAlreadyLogged,
    isOnline: userRes.isOnline,
    lastConnectionRequest: userRes.lastConnectionRequest,
  };
};
