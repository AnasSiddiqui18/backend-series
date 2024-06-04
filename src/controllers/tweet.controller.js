import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Tweets } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const tweet = await Tweets.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "Issue while creating a new tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"));
});

const getTweetById = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const tweet = await Tweets.findById(tweetId);
  console.log("tweet", tweet);

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet fetched successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  const userTweets = await Tweets.find({ owner: userId });

  if (!userTweets) {
    throw new ApiError("issue while getting the user tweets");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "user tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }

  const { updatedTweet } = req.body;

  if (!updatedTweet) {
    throw new ApiError(400, "updated tweet is required");
  }

  const newTweet = await Tweets.findByIdAndUpdate(
    tweetId,
    {
      content: updatedTweet,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }

  await Tweets.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getTweetById };
