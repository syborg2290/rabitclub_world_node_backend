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

var forgotPasswordEmailHistory = [];

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

  async ChangeForgotPassword(username, newPassword, code, res) {
    try {
      if (username !== null) {
        if (newPassword !== null) {
          if (username !== "") {
            if (newPassword !== "") {
              const existingUser = await this.repository.FindUserByUsername({
                username,
              });
              if (existingUser) {
                const index = forgotPasswordEmailHistory.findIndex(
                  (val) => val.id === existingUser._id.toString()
                );

                if (index >= 0) {
                  if (
                    forgotPasswordEmailHistory[index].code.toString() ===
                    code.toString()
                  ) {
                    let salt = await GenerateSalt();
                    let userPassword = await GeneratePassword(
                      newPassword,
                      salt
                    );
                    const id = existingUser._id;
                    const res = await this.repository.ChangePassword({
                      id,
                      userPassword,
                      salt,
                    });
                    if (res) {
                      return FormateData({
                        message: "done",
                        result: true,
                      });
                    }
                  } else {
                    return FormateData({
                      message: "Incorrect confirmation code",
                    });
                  }
                } else {
                  return FormateData({
                    message: "Incorrect confirmation code",
                  });
                }
              } else {
                return FormateData({
                  message: "Not found any account with entered username",
                });
              }
            } else {
              return FormateData({
                message: "Password is required!",
              });
            }
          } else {
            return FormateData({
              message: "Username is required!",
            });
          }
        }
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async SendForgotPasswordCode(username, res) {
    try {
      if (username !== null) {
        if (username !== "") {
          const existingUser = await this.repository.FindUserByUsername({
            username,
          });
          if (existingUser) {
            let code = Math.floor(10000 + Math.random() * 90000);

            if (
              forgotPasswordEmailHistory.filter(
                (val) => val.id === existingUser._id.toString()
              ).length > 0
            ) {
              let index = forgotPasswordEmailHistory.findIndex(
                (val) => val.id === existingUser._id.toString()
              );

              if (
                (new Date().getTime() -
                  new Date(
                    new Date(forgotPasswordEmailHistory[index].time)
                  ).getTime()) /
                  1000 >=
                60
              ) {
                await SendVerificationCodeToEmail(code, existingUser.email);
                forgotPasswordEmailHistory[index] = {
                  id: existingUser._id.toString(),
                  code: code,
                  time: new Date(),
                };
                return FormateData({
                  message: "done",
                  result: true,
                });
              } else {
                let seconds =
                  Math.floor(
                    60 -
                      (new Date().getTime() -
                        new Date(
                          forgotPasswordEmailHistory[index].time
                        ).getTime()) /
                        1000
                  ) < 0
                    ? 0 + " seconds"
                    : Math.floor(
                        60 -
                          (new Date().getTime() -
                            new Date(
                              forgotPasswordEmailHistory[index].time
                            ).getTime()) /
                            1000
                      ) + " seconds";
                return FormateData({
                  message: "You have to wait before next try, " + seconds,
                });
              }
            } else {
              await SendVerificationCodeToEmail(code, existingUser.email);
              forgotPasswordEmailHistory.push({
                id: existingUser._id.toString(),
                code: code,
                time: new Date(),
              });
              return FormateData({
                message: "done",
                result: true,
              });
            }
          } else {
            return FormateData({
              message: "Not found any account with entered username",
            });
          }
        } else {
          return FormateData({
            message: "Username is required!",
          });
        }
      }
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async ChangePassword(token, userInputs, res) {
    try {
      const { password, newPassword } = userInputs;
      if (password || newPassword !== null) {
        if (password || newPassword !== "") {
          const id = (await GetIdFromSignature(token))._id;
          const existingUser = await this.repository.FindUserByIdWithPassword({
            id,
          });
          if (existingUser) {
            // create salt
            const validPassword = await ValidatePassword(
              password,
              existingUser.password,
              existingUser.salt
            );

            if (validPassword) {
              let salt = await GenerateSalt();
              let userPassword = await GeneratePassword(newPassword, salt);
              const res = await this.repository.ChangePassword({
                id,
                userPassword,
                salt,
              });
              if (res) {
                return FormateData({
                  message: "done",
                  result: true,
                });
              }
            } else {
              return FormateData({
                message: "Wrong password,try again!",
              });
            }
          }
        } else {
          return FormateData({
            message: "Values can not be empty!",
          });
        }
      }
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

  async SearchUsers(token, searchText, res) {
    try {
      const id = (await GetIdFromSignature(token))._id;
      const res = await this.repository.SearchUsers(searchText, id);
      if (res) {
        return FormateData({
          message: "done",
          result: res,
        });
      } else {
        return FormateData({
          message: "Users not found!",
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
            (new Date().getTime() -
              new Date(new Date(user.lastConnectionRequest)).getTime()) /
              1000 >=
            60
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
      const userId = (await GetIdFromSignature(token))._id;
      const res = await this.repository.amIFollowing({ userId, followingId });

      return FormateData({
        message: "done",
        result: res,
      });
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
