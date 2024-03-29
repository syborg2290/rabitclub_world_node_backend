import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      max: 50,
      required: true,
      unique: true,
      sparse: true,
    },
    password: { type: String, min: 8, required: true },
    username: {
      type: String,
      min: 3,
      max: 20,
      required: true,
      unique: true,
      index: true,
    },
    profile_pic: { type: String },
    bio: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId }],
    salt: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

export const UserModel = mongoose.model("user", UserSchema);
