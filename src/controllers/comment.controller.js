import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "video id is required");

  const { page = 1, limit = 10 } = req.query;

  const aggregationPipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(`${videoId}`),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",

        pipeline: [
          {
            $project: {
              avatar: 1,
              fullName: 1,
              userName: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        content: 1,
        video: 1,
        owner: {
          $first: "$owner",
        },
      },
    },
  ];

  const comments = await Comment.aggregate(aggregationPipeline)
    .skip((parseInt(page) - 1) * limit)
    .limit(parseInt(limit));

  const totalComments = await Comment.countDocuments({
    video: new mongoose.Types.ObjectId(`${videoId}`),
  });

  return res.status(200).json({
    comments,
    totalComments,
    currentPage: page,
    limit: limit,
    success: true,
    message: "video comments fetched successfully",
  });
});

const getTweetComments = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) throw new ApiError(400, "tweet id is required");

  const { page = 1, limit = 10 } = req.query;

  const aggregationPipeline = [
    {
      $match: {
        tweet: new mongoose.Types.ObjectId(`${tweetId}`),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",

        pipeline: [
          {
            $project: {
              fullName: 1,
              userName: 1,
              avatar: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },

    {
      $project: {
        owner: {
          $first: "$owner",
        },
        content: 1,
        createdAt: 1,
      },
    },
  ];

  const tweetComments = await Comment.aggregate(aggregationPipeline)
    .skip((parseInt(page) - 1) * limit)
    .limit(parseInt(limit));

  const totalComments = await Comment.countDocuments({
    tweet: new mongoose.Types.ObjectId(`${tweetId}`),
  });

  return res.status(200).json({
    tweetComments,
    totalComments,
    currentPage: page,
    limit: limit,
    success: true,
    message: "tweet comments fetched successfully",
  });
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) throw new ApiError(400, "content is required");

  if (!videoId) throw new ApiError(400, "video id is required");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) throw new ApiError(400, "error while creating the comment");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment created successfully"));
});

const addCommentOnTweets = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }

  const createCommentOnTweet = await Comment.create({
    content,
    tweet: tweetId,
    owner: req.user._id,
  });

  if (!createCommentOnTweet) {
    throw new ApiError(400, "issue while creating comment on tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createCommentOnTweet, "Tweet comment created"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;
  const { updatedComment } = req.body;

  console.log("comment id", commentId);
  console.log("updated comment", updatedComment);

  if (!commentId) throw new ApiError(200, "comment id not provided");

  if (!updatedComment) throw new ApiError(200, "comment is missing");

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: updatedComment,
    },
    {
      new: true,
    }
  );

  if (!comment) throw new ApiError("issue while updating the comment");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;

  if (!commentId) throw new ApiError(400, "comment id is required");

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) throw new ApiError(400, "issue while deleting the comment");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  addCommentOnTweets,
  getTweetComments,
};
