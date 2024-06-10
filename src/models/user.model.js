import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // if we want to enable searching in database so it's a better way to make the index to true.
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // cloudinary url
      required: true,
      // trim: true,
      index: true,
    },

    coverImage: {
      type: String, // cloudinary url
      // trim: true,
      index: true,
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    refreshToken: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // It will run just before the data will save to the DB. We want to store a hashed password in DB so that's why we are doing something like this.

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  console.log("isPasswordCorrect", password);
  return await bcrypt.compare(password, this.password);
};

// generating access token

userSchema.methods.generateAccessToken = function () {
  console.log("access token function is working");

  return Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },

    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  console.log("refresh token function is working");

  return Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = model("User", userSchema);
