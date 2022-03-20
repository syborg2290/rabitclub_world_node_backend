import { UserModel } from "../models/User.js";
import {
  APIError,
  BadRequestError,
  STATUS_CODES,
} from "../../utils/app-errors.js";

class UserRepository {
  async CreateUser({
    email,
    password,
    username,
    profile_pic,
    isVerified,
    salt,
    key,
  }) {
    try {
      const user = new UserModel({
        email,
        password,
        username,
        profile_pic,
        isVerified,
        salt,
        key,
      });
      const userResult = await user.save();
      return userResult;
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
      return existingUsername;
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
      return existingEmail;
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
      return existingUser;
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
      return res;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find User"
      );
    }
  }

  async UpdateProfile({ id, email, bio, url }) {
    try {
      const existingUser = await UserModel.findById(id);
      existingUser.email = email;
      existingUser.bio = bio;
      existingUser.profile_pic = url;
      const res = await existingUser.save();
      return res;
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
