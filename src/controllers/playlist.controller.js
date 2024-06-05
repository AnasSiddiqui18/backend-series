import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name || !description) {
    throw new ApiError(400, "name and description is required");
  }

  const playList = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playList) {
    throw new ApiError(400, "problem while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(400, "user id is required");
  }

  const userPlaylist = await Playlist.find({ owner: userId });

  if (!userPlaylist) {
    throw new ApiError(400, "playlist by user id not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylist, "user playlist found successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "playlist id is required");
  }

  const playList = await Playlist.findById(playlistId);

  if (!playList) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "playlist found successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new ApiError(400, "playlist Id and video Id is required");
  }

  const isVideoPresent = await Video.findById(videoId);

  if (!isVideoPresent) {
    throw new ApiError(400, "video not present");
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId },
    },
    {
      new: true,
    }
  );

  if (!updatePlaylist) {
    throw new ApiError(
      400,
      "problem while adding the video id in the playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(400, updatePlaylist, "playlist updated successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!playlistId || !videoId) {
    throw new ApiError(400, "playlist Id and video Id is required");
  }

  const isVideoPresent = await Video.findById(videoId);

  if (!isVideoPresent) {
    throw new ApiError(400, "video not found");
  }

  const isVideoRemoved = await Playlist.updateOne(
    { _id: playlistId },

    {
      $pull: { videos: videoId },
    }
  );

  if (!isVideoRemoved) {
    throw new ApiError(400, "issue while removing the video");
  }

  const updatedPlaylist = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  const playList = await Playlist.findByIdAndDelete(playlistId);

  if (!playList) {
    throw new ApiError(400, "error while deleting the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId || !name || !description) {
    throw new ApiError(400, "playlist id, name and description is required");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "issue while updating the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
