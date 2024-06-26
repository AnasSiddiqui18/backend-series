import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  deletePreviousImage,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // TODO: get all videos based on query, sort, pagination

  console.log("limit", limit);

  let sortCriteria = {};
  let videoQuery = {};

  if (userId) {
    videoQuery.owner = userId;
  }

  if (query) {
    videoQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (sortBy && sortType) {
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1; // sortCriteria = {createdAt: -1}
  }

  const videos = await Video.find(videoQuery)
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  if (!videos.length) {
    throw new ApiError(400, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

function formatDuration(duration) {
  // Convert duration to integer seconds
  const totalSeconds = Math.floor(duration);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the values to always display two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  // Construct and return the formatted time string
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  //   We are getting title & description from req.body
  // we have to get thumbnail & video file from the req.files then store the thumbnail and video on cloudinary
  // extract the duration of the video upload on the cloudinary

  const { title, description } = req.body;

  console.log("title", title);
  console.log("description", description);
  console.log("video file", req.files.videoFile);
  console.log("thumbnail", req.files.thumbnail);

  const videoFileLocalPath = req.files.videoFile && req.files.videoFile[0].path;
  const thumbnailLocalPath = req.files.thumbnail && req.files.thumbnail[0].path;

  console.log("video file path", videoFileLocalPath);
  console.log("thumbnail file path", thumbnailLocalPath);

  if (!videoFileLocalPath) {
    throw new ApiError(400, "video file is missing");
  }

  const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!cloudinaryThumbnail) {
    throw new ApiError(
      400,
      "Error while uploading the thumbnail on cloudinary"
    );
  }

  console.log("cloudinary thumbnail", cloudinaryThumbnail);

  const cloudinaryVideoFile = await uploadOnCloudinary(videoFileLocalPath);

  if (!cloudinaryVideoFile) {
    throw new ApiError(400, "Error while uploading the video on cloudinary");
  }

  console.log("cloudinary video file", cloudinaryVideoFile);
  console.log("video file duration", cloudinaryVideoFile.duration);

  const formattedTime = formatDuration(cloudinaryVideoFile.duration);

  const uploadVideoOnDB = await Video.create({
    title: title,
    description: description,
    thumbnail: cloudinaryThumbnail.url,
    videoFile: cloudinaryVideoFile.url,
    isPublished: true,
    duration: formattedTime,
    owner: req.user._id, // req.user._id is the current user
  });

  if (!uploadVideoOnDB) {
    throw new ApiError(400, "error while creating the document in the DB");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadVideoOnDB, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //TODO: get video by id
  // Our goal is to get the video by it's id.

  const currentUser = await User.findById(req.user._id);

  const isVideoPresentInHistory = currentUser.watchHistory.find((watchedId) =>
    new mongoose.Types.ObjectId(`${watchedId}`).equals(videoId)
  );

  let video;

  if (!isVideoPresentInHistory) {
    video = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { views: 1 },
      },
      {
        new: true,
      }
    );
  } else {
    video = await Video.findById(videoId);
  }

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  await await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { watchHistory: videoId }, // the $addToSet method will add elements to an array if it's not exist.
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video by id fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const previousThumbnail = await Video.findById(videoId);

  console.log("previous thumbnail", previousThumbnail);

  const previousPublicId = await deleteImageFromCloudinary(
    previousThumbnail.thumbnail
  );

  const response = await deletePreviousImage(previousPublicId);
  console.log("previous thumbnail deleted successfully", response);

  console.log("thumbnail local path", req.file.path);

  const newThumbnailLocalPath = req.file.path;
  console.log("new thumbnail path", newThumbnailLocalPath);

  const cloudinaryUpdatedThumbnail = await uploadOnCloudinary(
    newThumbnailLocalPath
  );

  const video = await Video.findByIdAndUpdate(videoId, {
    thumbnail: cloudinaryUpdatedThumbnail.url,
  });

  if (!video) {
    throw new ApiError(400, "error while updating the thumbnail");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "video description updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) throw new ApiError(400, "video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  console.log("video id", videoId);

  const video = await Video.findById(videoId);

  if (!video) {
    return res.status(404).json(new ApiError(404, null, "Video not found"));
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      isPublished: !video.isPublished,
    },
    { new: true }
  );

  console.log("new publish status", updatedVideo?.isPublished);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Publish status changed successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
