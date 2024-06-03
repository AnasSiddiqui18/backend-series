import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
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

export { getVideoComments, addComment, updateComment, deleteComment };
