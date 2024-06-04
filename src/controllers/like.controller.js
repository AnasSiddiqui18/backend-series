import mongoose, { isValidObjectId } from "mongoose";
import { Likes } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweets } from "../models/tweets.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const videoIsPresent = await Video.findById(videoId);

  if (!videoIsPresent) throw new ApiError(400, "video is not present");

  const isLiked = await Likes.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  console.log(isLiked);

  if (isLiked) {
    await Likes.findByIdAndDelete(isLiked._id);
  } else {
    await Likes.create({
      video: videoId,
      likedBy: req.user._id,
    });
  }

  const checkIsLiked = await Likes.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let isLikedVideo;

  if (checkIsLiked) {
    isLikedVideo = true;
  } else {
    isLikedVideo = false;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLikedVideo },
        isLikedVideo ? "video liked successfully" : "video unliked successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  const isCommentPresent = await Comment.findById(commentId);

  if (!isCommentPresent) {
    throw new ApiError(400, "comment is not present");
  }

  const isCommentLiked = await Likes.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  let liked;

  if (!isCommentLiked) {
    await Likes.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    liked = true;
  } else {
    await Likes.findByIdAndDelete(isCommentLiked?._id);
    liked = false;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        liked,
      },
      liked ? "comment liked successfully" : "comment unliked successfully"
    )
  );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }

  const isTweetIdPresent = await Tweets.findById(tweetId);

  if (!isTweetIdPresent) {
    throw new ApiError(400, "tweet is not present");
  }

  const isTweetLikePresent = await Likes.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  let isLiked;

  if (!isTweetLikePresent) {
    await Likes.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    isLiked = true;
  } else {
    await Likes.findByIdAndDelete(isTweetLikePresent?._id);
    isLiked = false;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked },
        isLiked ? "tweet liked successfully" : "tweet unliked successfully"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likesWithVideo = await Likes.find({ video: { $exists: true } });

  return res
    .status(200)
    .json(new ApiResponse(200, likesWithVideo, "All liked videos fetched"));
});

const getVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const isVideoPresent = await Video.findById(videoId);

  if (!isVideoPresent) {
    throw new ApiError(400, "video not found");
  }

  const videoLikes = await Likes.find({
    video: videoId,
  });

  if (!videoLikes) {
    throw new ApiError(400, "video likes not found");
  }

  const LikesLength = videoLikes?.length;

  return res.status(200).json({
    status: 200,
    videoLikes,
    LikesLength,
    success: true,
    message: "tweet likes fetched successfully",
  });
});

const getTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "tweet id is required");
  }

  const isTweetPresent = await Tweets.findById(tweetId);

  if (!isTweetPresent) {
    throw new ApiError(400, "tweet not found");
  }

  const tweetLikes = await Likes.find({
    tweet: tweetId,
  });

  if (!tweetLikes) {
    throw new ApiError(400, "tweet likes not found");
  }

  const LikesLength = tweetLikes?.length;

  return res.status(200).json({
    status: 200,
    tweetLikes,
    LikesLength,
    success: true,
    message: "tweet likes fetched successfully",
  });
});

const getCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "comment id is required");
  }

  const isCommentPresent = await Comment.findById(commentId);

  if (!isCommentPresent) {
    throw new ApiError(400, "comment not found");
  }

  const commentLikes = await Likes.find({
    comment: commentId,
  });

  if (!commentLikes) {
    throw new ApiError(400, "comment likes not found");
  }

  const LikesLength = commentLikes?.length;

  return res.status(200).json({
    status: 200,
    commentLikes,
    LikesLength,
    success: true,
    message: "comment likes fetched successfully",
  });
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getVideoLikes,
  getTweetLikes,
  getCommentLikes,
};
