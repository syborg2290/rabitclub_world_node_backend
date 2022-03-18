import UserRepository from "../database/repositories/user_repository.js";
import {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  GetIdFromSignature,
  ValidatePassword,
  SendVerificationCodeToEmail,
} from "../utils/utils.js";
import { APIError, BadRequestError } from "../utils/app-errors.js";
import ShortUniqueId from "short-unique-id";

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async SignUp(userInputs, res) {
    const { email, password, username } = userInputs;

    try {
      if (email || password || username !== null) {
        if (email || password || username !== "") {
          const existingEmail = await this.repository.FindUserByEmail({
            email,
          });
          const existingUsername = await this.repository.FindUserByUsername({
            username,
          });
          if (!existingEmail) {
            if (!existingUsername) {
              // create salt
              let salt = await GenerateSalt();
              let shortUuid = new ShortUniqueId({ length: 10 });
              let key = shortUuid();
              const isVerified = false;
              const profile_pic = "";

              let userPassword = await GeneratePassword(password, salt);

              const existingUser = await this.repository.CreateUser({
                email,
                password: userPassword,
                username,
                profile_pic,
                isVerified,
                key,
                salt,
              });

              const token = await GenerateSignature({
                _id: existingUser._id,
              });

              return res
                .status(201)
                .cookie("token", token, {
                  secure: false,
                  httpOnly: true,
                  sameSite: "lax",
                })
                .send({
                  message: "done",
                });
            } else {
              return FormateData({
                message: "Username is already used!",
              });
            }
          } else {
            return FormateData({
              message: "Email address is already used!",
            });
          }
        } else {
          return FormateData({
            message: "Values can not be empty!",
          });
        }
      }
      return FormateData({
        message: "Values can not be null!",
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async SignIn(userInputs, res) {
    const { username, password } = userInputs;

    try {
      if (password || username !== null) {
        if (password || username !== "") {
          const existingUser = await this.repository.FindUserByUsername({
            username,
          });

          if (existingUser) {
            // create salt
            const validPassword = await ValidatePassword(
              password,
              existingUser.password,
              existingUser.salt
            );

            if (validPassword) {
              const token = await GenerateSignature({
                _id: existingUser._id,
              });
              return res
                .status(201)
                .cookie("token", token, {
                  secure: false,
                  httpOnly: true,
                  sameSite: "lax",
                })
                .send({
                  message: "done",
                });
            } else {
              return FormateData({
                message: "Wrong password,try again!",
              });
            }
          } else {
            return FormateData({
              message: "Username didn't match with any account!",
            });
          }
        } else {
          return FormateData({
            message: "Values can not be empty!",
          });
        }
      }
      return FormateData({
        message: "Values can not be null!",
      });
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetUser(token, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const user = await this.repository.FindUserById({
        id,
      });
      if (user) {
        return FormateData({
          message: "done",
          id: id,
          user: user.username,
        });
      } else {
        return FormateData({
          message: "User not found!",
        });
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async GetUserFromId(id, res) {
    try {
      const user = await this.repository.FindUserById({
        id,
      });
      if (user) {
        return FormateData({
          message: "done",
          user: user,
        });
      } else {
        return FormateData({
          message: "User not found!",
        });
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async UpdateCoverPic(token, url, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const res = await this.repository.UpdateCoverPic({ id, url });
      if (res) {
        return FormateData({
          message: "done",
          result: res,
        });
      } else {
        return FormateData({
          message: "User not found!",
        });
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
}

export default UserService;
