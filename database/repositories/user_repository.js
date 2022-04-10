import { UserModel } from "../models/User.js";
import {
  APIError,
  BadRequestError,
  STATUS_CODES,
} from "../../utils/app-errors.js";
import { UserObj } from "../utils.js";

class UserRepository {
  async CreateUser({ email, password, username, isVerified, salt, key }) {
    try {
      const user = new UserModel({
        email,
        password,
        username,
        isVerified,
        salt,
        key,
      });
      const userResult = await user.save();
      const reObj = UserObj(userResult, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Create User"
      );
    }
  }

  async FindUserByUsername({ username }) {
    try {
      const existingUsername = await UserModel.findOne({ username: username });
      if (!existingUsername) {
        return;
      }
      const reObj = UserObj(UserObj, false);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async FindUserByEmail({ email }) {
    try {
      const existingEmail = await UserModel.findOne({ email: email });
      if (!existingEmail) {
        return;
      }
      const reObj = UserObj(UserObj, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async FindUserById({ id }) {
    try {
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return;
      }
      const reObj = UserObj(UserObj, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async UpdateCoverPic({ id, url }) {
    try {
      const existingUser = await UserModel.findById(id);
      existingUser.cover_pic = url;
      const res = await existingUser.save();
      const reObj = UserObj(res, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async amIFollowing({ userId, followingId }) {
    try {
      const followedUser = await UserModel.findById(followingId);
      return followedUser.followers.includes(userId);
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async followUser({ followerId, followingId }) {
    try {
      const followingUser = await UserModel.findById(followingId);
      const followerUser = await UserModel.findById(followerId);

      let followings = followingUser.following;
      let followers = followingUser.followers;

      if (followingUser.following.includes(followerId)) {
        const indexFollowing = followings.indexOf(followerId);
        const indexFollower = followings.indexOf(followingId);

        followings.splice(indexFollowing, 1);
        followers.splice(indexFollower, 1);
      } else {
        followings.push(followerId);
        followers.push(followingId);
      }

      followingUser.following = followings;
      followerUser.followers = followers;

      const resFollowing = await followingUser.save();
      const resFollower = await followerUser.save();

      const reObj = UserObj(resFollowing, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async SetLogged({ id, status }) {
    try {
      const existingUser = await UserModel.findById(id);
      existingUser.isAlreadyLogged = status;
      const res = await existingUser.save();
      const reObj = UserObj(res, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async SetOnline({ id, status }) {
    try {
      const existingUser = await UserModel.findById(id);
      existingUser.isOnline = status;
      const res = await existingUser.save();
      const reObj = UserObj(res, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async SetOnlineRequestTime({ id }) {
    try {
      const existingUser = await UserModel.findById(id);
      existingUser.lastConnectionRequest = new Date();
      const res = await existingUser.save();
      const reObj = UserObj(res, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async UpdateProfile({
    id,
    email,
    bio,
    profile_pic_small,
    profile_pic_medium,
    profile_pic_default,
  }) {
    try {
      const existingUser = await UserModel.findById(id);
      existingUser.email = email;
      existingUser.bio = bio;
      existingUser.profile_pic_small = profile_pic_small;
      existingUser.profile_pic_medium = profile_pic_medium;
      existingUser.profile_pic_default = profile_pic_default;
      const res = await existingUser.save();
      const reObj = UserObj(res, true);
      return reObj;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }
}

export default UserRepository;
