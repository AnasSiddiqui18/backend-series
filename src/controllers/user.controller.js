import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  deletePreviousImage,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const generateAccessAndRefreshTokens = async (userId) => {
  console.log("user id", userId);

  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  console.log("req body", req.body);

  const { userName, email, fullName, password } = req.body;

  if (
    [fullName, email, password, userName].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  console.log("email", email);

  //  adding validation to check that if email contais @ symbol

  if (!email.includes("@")) throw new ApiError(400, "Email is not valid");

  //  check that if the user is already present in the database.
  const existingUser = await User.findOne({ email });

  // const passwordCheck = await existingUser.isPasswordCorrect(password);
  // console.log("password check", passwordCheck);
  // console.log("existing user", existingUser);

  if (existingUser) {
    throw new ApiError(409, "User already exist"); // we are throwing the api error class and it will caught by async handler catch block
  }

  console.log("request file object", req.files.avatar);

  const avatarLocalPath = req?.files?.avatar && req?.files?.avatar[0]?.path;

  console.log("avatarLocalPath", avatarLocalPath);

  const coverImageLocalPath =
    req?.files?.coverImage && req?.files?.coverImage[0]?.path;

  console.log("coverImageLocalPath", coverImageLocalPath);

  req.files ? console.log("req.files", req.files) : null;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  const cloudinaryAvatarUrl = await uploadOnCloudinary(avatarLocalPath);
  console.log("cloudinaryAvatarUrl", cloudinaryAvatarUrl);

  const cloudinaryCoverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
  console.log("cloudinaryCoverImageUrl", cloudinaryCoverImageUrl);

  if (!cloudinaryAvatarUrl)
    throw new ApiError(400, "Cloudinary Avatar file is required");

  const DB = await User.create({
    userName: userName.toLowerCase(),
    avatar: cloudinaryAvatarUrl?.url,
    coverImage: cloudinaryCoverImageUrl?.url || "",
    fullName,
    email,
    password,
  });

  if (!DB)
    throw new ApiError(500, "Something went wrong while registering the user");

  const user = await User.findById(DB._id).select("-password");

  res
    .status(201)
    .json(new ApiResponse(200, user, "User registered successfully"));

  //   new ApiResponse(200, createdUser);

  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check avatar
  // upload the avatar to cloudinary, check that avatar get uploads on cloudinary
  //    create user object - create entry in db
  // remove password and refresh token field
  // check for user creation
  //   return res
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;

  console.log("password in login function", password);

  console.log("req body data", req.body);

  console.log("login email", email);

  if (email) {
    console.log("email is present", email);
  }

  if (!userName && !email) {
    // if the user name or the email both fields are not provided by the user so we will throw an error.
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  console.log("user present", user);

  if (!user) throw new ApiError(404, "user does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

  console.log("login function is working");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  console.log("login access token", accessToken);
  console.log("login refresh token", refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // adding cookie using cookie parser package. By this we can verify the user that the user is logged in or not.
    .cookie("refreshToken", refreshToken, options) // adding cookie using cookie parser package. // //
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        }, // we are also setting the cookie on the frontend as well sending the cookie in the response if the user want's also to store this cookie in the local storage or anywhere in the frontend.
        "User logged in successfully"
      )
    );

  // the reason why we are making the httpOnly and secure to true is that the cookie will not modify from frontend. It will only be modify on the backend only.

  // req.body -> data
  // username or email
  // find the user
  //  password check
  // generate access & refresh token
  // send cookie and send response
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // deleting the refresh token when the user logs out.
      },
    },
    { new: true }
  );

  // $set is used to add a new field or update the existing value of a field.

  // $unset is used to remove a field.

  console.log("updated user", user);

  console.log("req user logout", req.user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = JWT.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used.");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  console.log("old password", oldPassword);
  console.log("new password", newPassword);

  try {
    const user = await User.findById(req.user?._id);
    console.log("user in update password function", user);
    if (!user) throw new ApiError(401, "Unauthorized Request");

    const verifyPassword = await user.isPasswordCorrect(oldPassword);
    if (!verifyPassword) throw new ApiError(400, "Invalid old password"); // verifying the old password with the password present in the DB
    console.log("verify password", verifyPassword);

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid credentials");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const currentUser = req.user;
    res.status(200).json(
      new ApiResponse(
        200,
        {
          currentUser,
        },
        "Successfully fetched current user"
      )
    );
  } catch (error) {
    throw new ApiError(
      400,
      error?.message || "Error while getting the current user"
    );
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) throw new ApiError(401, "All fields are required");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  if (!user) throw new ApiError(401, "User can't update");

  console.log("fullname and email updated successfully", user);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      "Account details updated successfully"
    )
  );
});

const deleteImageFromCloudinary = (url) => {
  const publicId = url.split("/").pop().split(".")[0];
  return publicId;
};

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) throw new ApiError(401, "avatar not found");

  const previousCloudinaryAvatarUrl = req?.user?.avatar;
  console.log("previous image url", previousCloudinaryAvatarUrl);

  const publicId = deleteImageFromCloudinary(previousCloudinaryAvatarUrl);

  console.log("public id", publicId);

  await deletePreviousImage(publicId);

  const cloudinaryAvatarUrl = await uploadOnCloudinary(avatarLocalPath);
  console.log("avatar uploaded on cloudinary", cloudinaryAvatarUrl);

  if (!cloudinaryAvatarUrl.url)
    throw new ApiError(400, "Error while uploading avatar image");

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        avatar: cloudinaryAvatarUrl.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, { updatedUser }, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;

  console.log("current user", req.user);

  if (!coverImageLocalPath) throw new ApiError(401, "cover image not found");

  const previousCloudinaryCoverImageUrl = req?.user?.coverImage;

  console.log("previous cloudinary image url", previousCloudinaryCoverImageUrl);

  const publicId = deleteImageFromCloudinary(previousCloudinaryCoverImageUrl);

  console.log("previous public id", publicId);

  await deletePreviousImage(publicId);

  const cloudinarycoverImageUrl = await uploadOnCloudinary(coverImageLocalPath);
  console.log("avatar uploaded on cloudinary", cloudinarycoverImageUrl);

  if (!cloudinarycoverImageUrl.url)
    throw new ApiError(400, "Error while uploading cover image");

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        coverImage: cloudinarycoverImageUrl.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedUser }, "Cover Image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; // for example the channel name is Hitesh Choudhary

  console.log("req params", username);

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: username?.toLowerCase(), // for example the result is {_id:1, userName:"Hitesh Choudhary" }
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", // this is the _id which is found in the $match method
        foreignField: "channel",
        as: "subscribers", // at the last an array will get construct so we are defining the name of the array
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers", // this will count the number of subscriber
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo", // this will count the number of channel user subscribed to.
        },

        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  console.log("channel", channel);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(`${req.user?._id}`), // getting the current logged in user
      },
    },

    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id", // we will fill the video in the watch history property of the user.
        as: "watchHistory", // watch history is an array contains the video id
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",

              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    email: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          {
            $project: {
              thumbnail: 1,
              videoFile: 1,
              title: 1,
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  console.log("user watch history fetched successfully", user[0].watchHistory);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const emptyWatchHistory = asyncHandler(async (req, res) => {
  console.log("current user", req.user._id);

  // this function will make the current user watch history array empty

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        watchHistory: null,
      },
    },
    {
      new: true,
    }
  ).select("-refreshToken");

  if (!user) throw new ApiError(400, "error while updating the watch history");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "watch history updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  emptyWatchHistory,
};
