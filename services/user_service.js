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

              let userPassword = await GeneratePassword(password, salt);

              const existingUser = await this.repository.CreateUser({
                email,
                password: userPassword,
                username,
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
                  user: existingUser,
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
                  user: existingUser,
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

  async IsLogged(id, res) {
    try {
      const user = await this.repository.FindUserById({
        id,
      });
      if (user) {
        return FormateData({
          message: "done",
          isLogged: user.isAlreadyLogged,
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

  async SetLogged(token, status, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const user = await this.repository.SetLogged({
        id,
        status,
      });
      if (user) {
        return FormateData({
          message: "done",
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

  async SetOnline(token, status, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const user = await this.repository.SetOnline({
        id,
        status,
      });
      if (user) {
        return FormateData({
          message: "done",
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

  async SetOnlineRequestTime(token, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const user = await this.repository.SetOnlineRequestTime({
        id,
      });
      if (user) {
        return FormateData({
          message: "done",
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

  async GetAllUsers(page, token, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const users = await this.repository.GetAllUsers({
        page,
        id,
      });

      if (users) {
        return FormateData({
          message: "done",
          users: users,
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
          userData: user,
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
        if (user.isOnline) {
          if (
            new Date(user.lastConnectionRequest).getMinutes() -
              new Date().getMinutes() >
            1
          ) {
            await this.repository.SetOnline({
              id,
              status: false,
            });
          }
        }
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

  async amIFollowing(token, followingId) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const res = await this.repository.amIFollowing({ id, followingId });
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

  async followUser(token, followerId) {
    try {
      const followingId = (await GetIdFromSignature(token))._id;
      const res = await this.repository.followUser({ followerId, followingId });
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

  async UpdateProfile(
    token,
    email,
    bio,
    profile_pic_small,
    profile_pic_medium,
    profile_pic_default,
    res
  ) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const user = await this.repository.FindUserById({
        id,
      });
      const existingEmail = await this.repository.FindUserByEmail({
        email,
      });
      if (existingEmail && email !== user.email) {
        return FormateData({
          message: "Email already used!",
        });
      } else {
        const res = await this.repository.UpdateProfile({
          id,
          email,
          bio,
          profile_pic_small,
          profile_pic_medium,
          profile_pic_default,
        });
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
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }
}

export default UserService;
